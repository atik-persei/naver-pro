import { BaseStorage, createStorage, StorageType } from '@src/shared/storage/base';

type ConfigStorage = BaseStorage<Config> & {
  toggle: () => Promise<void>;
};

type Config = {
  GlobalApplicationScope: boolean;
};

const storage = createStorage<Config>('config', { GlobalApplicationScope: false }, {
  storageType: StorageType.Local,
  liveUpdate: true,
});

const configStorage: ConfigStorage = {
  ...storage,
  toggle: async () => {
    await storage.set((currentConfig) => ({
      ...currentConfig,
      GlobalApplicationScope: !currentConfig.GlobalApplicationScope,
    }));
  },
};

export default configStorage;