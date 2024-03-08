import { BaseStorage, createStorage, StorageType } from '@src/shared/storage/base';

type ConfigStorage = BaseStorage<Config> & {
  toggle: (type: string) => Promise<void>;
};

type Config = {
  Toc: boolean
  TocGlobalApplicationScope: boolean;
};

const storage = createStorage<Config>('config', { Toc: true, TocGlobalApplicationScope: false }, {
  storageType: StorageType.Local,
  liveUpdate: true,
});

const configStorage: ConfigStorage = {
  ...storage,
  toggle: async (type) => {
    if (type == 'toc') {
      await storage.set((currentConfig) => ({
        ...currentConfig,
        Toc: !currentConfig.Toc,
      }));

      await storage.set((currentConfig) => ({
        ...currentConfig,
        TocGlobalApplicationScope: false,
      }));
    }
    if (type == 'toc-global-application-scope') {
      await storage.set((currentConfig) => ({
        ...currentConfig,
        TocGlobalApplicationScope: !currentConfig.TocGlobalApplicationScope,
      }));
    }
  },
};

export default configStorage;