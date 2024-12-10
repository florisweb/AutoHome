import { Service } from '../../../serviceLib.js';
import Logger from '../../../logger.js';

import { stat, mkdir, cp, rm } from 'node:fs/promises';
import { readdirSync } from 'fs'

import { FileManager, getCurDir } from '../../../DBManager.js';

const serverRoot = getCurDir() + '/..';
const backupStoragePath = getCurDir() + '/DBData/BackupManager_backups';


export default class extends Service {
    async setup() {
        await checkAndMakeDirectory(backupStoragePath);
            
        let lastBackup = await this.#getMostRecentBackupTime();
        let delta = new Date().getTime() - (lastBackup || 0);
        setTimeout(() => {
            this.backup();
            setInterval(() => this.backup(), this.config.backupInterval);
        }, this.config.backupInterval - delta);
    }

    async backup() {
        Logger.log("Backing up...", null, 'BACKUPMANAGER')
        const backupName = 'Backup_' + (new Date().getTime());
        await this.#createBackup(backupName, this.config.includeSource);
        await this.#runGarbageCollector();
    }


    async #runGarbageCollector() {
        let times = await this.#getBackupTimes();
        times.sort((a, b) => a > b);
        if (times.length <= this.config.maxBackupCount) return;
        for (let i = 0; i < times.length - this.config.maxBackupCount; i++)
        {
            Logger.log(`Removing backup ${times[i]}`, null, 'BACKUPMANAGER');
            await this.removeBackup('Backup_' + times[i]);
        }
    }

    async #getMostRecentBackupTime() {
        return (await this.#getBackupTimes())[0]
    }

    async #getBackupTimes() {
        let backupTimes = readdirSync(backupStoragePath, { withFileTypes: true })
            .filter(dirent => dirent.name != '.DS_Store')
            .map(dirent => parseInt(dirent.name.split('_')[1]));
        backupTimes.sort((a, b) => a < b);
        return backupTimes;
    }


    async #createBackup(_backupName, _includeCode = false) {
        // check if already exists
        await checkAndMakeDirectory(backupStoragePath + '/' + _backupName);

        this.#backupDBData(_backupName);
        if (_includeCode)
        {
            this.#backupInterfaceSrc(_backupName)
            this.#backupServerSrc(_backupName)
        }
    }

    async #backupInterfaceSrc(_backupName) {
        const interfacePath = serverRoot + '/interface';
        const storagePath = backupStoragePath + '/' + _backupName + '/interfaceSrc';
        await checkAndMakeDirectory(storagePath);

        const blacklist = ['.DS_Store', 'dist', 'node_modules'];
        await this.#copyFolderContentsWithFilter(interfacePath, storagePath, blacklist);
    }

    async #backupServerSrc(_backupName) {
        const serverPath = serverRoot + '/server';
        const storagePath = backupStoragePath + '/' + _backupName + '/serverSrc';
        await checkAndMakeDirectory(storagePath);

        const blacklist = ['.DS_Store', 'DBData', 'node_modules', 'config.json'];
        await this.#copyFolderContentsWithFilter(serverPath, storagePath, blacklist);
    }

    async #backupDBData(_backupName) {
        const serverPath = serverRoot + '/server';
        const storagePath = backupStoragePath + '/' + _backupName + '/data';
        await checkAndMakeDirectory(storagePath);
        await checkAndMakeDirectory(storagePath + '/DBData');
        await cp(serverPath + '/config.json', storagePath + '/config.json', {recursive: true});

        const blacklist = ['.DS_Store', 'BackupManager_backups'];
        await this.#copyFolderContentsWithFilter(serverPath + '/DBData', storagePath + '/DBData/', blacklist);
    }

    async #copyFolderContentsWithFilter(_inPath, _outPath, _blackList = []) {
        let fileNames = readdirSync(_inPath, { withFileTypes: true })
            .filter(dirent => !_blackList.includes(dirent.name))
            .map(dirent => dirent.name);

        for (let fileName of fileNames)
        {
            await cp(_inPath + '/' + fileName, _outPath + '/' + fileName, {recursive: true});
        }
    }

    async removeBackup(_backupName) {
        return removeDir(backupStoragePath + '/' + _backupName);
    }
}

const removeDir = async (dirPath) => {
  await rm(dirPath, {recursive: true});
}


const checkAndMakeDirectory = async (dir) => {
  try {
    await stat(dir);
  } catch (error) {
    if (error.code === "ENOENT") {
      try {
        await mkdir(dir);
      } catch (err) {
        console.error(err.message);
      }
    }
  }
}


