import React, { useEffect, useState } from 'react';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import configStorage from '@root/src/shared/storage/configStorage';
import useStorage from '@root/src/shared/hook/useStorage';

const Popup = () => {
  const configManager = useStorage(configStorage);

  const handleUpdateConfig = async (event) => {
    await configStorage.toggle(event.target.id)
  };

  return (
    <div className='App'>
      <div className='header'>
        <span>Naver Pro</span>
        <div className='icon'>
          <a href='https://discord.gg/WBTmzK5Jvs' target='_blank'>
            <img src='/assets/image/discord.svg' alt='discord' />
          </a>

          <a href='https://github.com/atik-persei' target='_blank'>
            <img src='/assets/image/github.svg' alt='github' />
          </a>
        </div>
      </div>

      <div className='body'>
        <div className='option'>
          <input
            id='toc'
            type='checkbox'
            checked={configManager.Toc}
            onChange={handleUpdateConfig}>
            </input>
            <label htmlFor='toc'>블로그 목차 보여주기</label>
        </div>

        <div className='option'>
          <input
            id='toc-global-application-scope'
            type='checkbox'
            checked={configManager.TocGlobalApplicationScope}
            onChange={handleUpdateConfig}
            disabled={configManager.Toc ? false : true}>
            </input>
            <label htmlFor='toc-global-application-scope'>지정되지 않는 블로그 목차 보여주기</label>
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);