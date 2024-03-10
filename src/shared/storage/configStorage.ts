import { BaseStorage, createStorage, StorageType } from '@src/shared/storage/base';

type TocDefaultTag = 'blockquote'

type ConfigStorage = BaseStorage<Config> & {
  update: (type: string) => Promise<void>;
};

type Config = {
  Toc: boolean
  TocDeafultTag: TocDefaultTag;
  TocGlobalApplicationScope: boolean;
};

const storage = createStorage<Config>('config', { Toc: true, TocDeafultTag: 'blockquote', TocGlobalApplicationScope: false }, {
  storageType: StorageType.Local,
  liveUpdate: true,
});

const configStorage: ConfigStorage = {
  ...storage,
  update: async (type) => {
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