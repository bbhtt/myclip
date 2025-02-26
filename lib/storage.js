'use strict';

import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { logError } from './utils.js';

// TODO : Switch to using asynchronous I/O when https://gitlab.gnome.org/GNOME/gjs/-/issues/327 is fixed

export const Storage = class {
    constructor(extension) {
        this._stateDir = Gio.File.new_for_path(GLib.build_filenamev([
            GLib.get_user_state_dir(),
            extension.uuid,
        ]));
        this._storageFile = this._stateDir.get_child(`storage.json`);
    }

    loadEntries() {
        let entries = [];
        if (this._storageFile.query_exists(null)) {
            try {
                entries = JSON.parse(this._loadFile(this._storageFile));
            } catch (error) {
                logError(`Failed to load storage`, error);
            }
        }

        return entries;
    }

    saveEntries(entries) {
        try {
            this._saveFile(this._storageFile, JSON.stringify(entries, [`id`], 2));
        } catch (error) {
            logError(`Failed to save storage`, error);
        }
    }

    loadEntryContent(entry) {
        const file = this._stateDir.get_child(entry.id.toString());
        try {
            entry.text = this._loadFile(file);
        } catch (error) {
            logError(`Failed to load entry content ${entry.id}`, error);
        }
    }

    saveEntryContent(entry) {
        const file = this._stateDir.get_child(entry.id.toString());
        try {
            this._saveFile(file, entry.text);
        } catch (error) {
            logError(`Failed to save entry content ${entry.id}`, error);
        }
    }

    deleteEntryContent(entry) {
        const file = this._stateDir.get_child(entry.id.toString());
        if (file.query_exists(null)) {
            try {
                this._deleteFile(file);
            } catch (error) {
                logError(`Failed to delete entry content ${entry.id}`, error);
            }
        }
    }

    _loadFile(file) {
        const [ok, bytes] = file.load_contents(null);
        if (!ok) {
            throw new Error(`Unknown error`);
        }
        return new TextDecoder().decode(bytes);
    }

    _saveFile(file, content) {
        const parentDir = file.get_parent();
        if (!parentDir.query_exists(null) && !parentDir.make_directory_with_parents(null)) {
            throw new Error(`Failed to create parent directory`);
        }

        const [ok] = file.replace_contents(
            content,
            null,
            false,
            Gio.FileCreateFlags.REPLACE_DESTINATION,
            null
        );
        if (!ok) {
            throw new Error(`Unknown error`);
        }
    }

    _deleteFile(file) {
        if (!file.delete(null)) {
            throw new Error(`Unknown error`);
        }
    }
};
