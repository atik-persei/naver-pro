import { useEffect, useState } from 'react';

export default function App() {
  const [criterionObject, setCriterionObject] = useState(null);

  useEffect(() => {
    tocElementController('init')

    // 페이지 이동 시 조회
    document.querySelector('#mainFrame').addEventListener('load', fetchCriterionObject);
  }, []);

  useEffect(() => {
    if (criterionObject == null) { return; }

    const iframeElement = document.querySelector('#mainFrame') as HTMLIFrameElement
    const iframeContent = iframeElement.contentDocument || iframeElement.contentWindow.document
    const titleElements = iframeContent.querySelectorAll(criterionObject.toc)
    console.log(titleElements)

    tocElementController('update', titleElements)
    tocElementController('mount', titleElements)
  }, [criterionObject])


  function tocElementController(type, titleElements?) {
    switch (type) {
      case 'init':
        const tocElement = document.createElement('div');
        tocElement.classList.add('tocElement');
        document.querySelector('body').appendChild(tocElement);
        break;
      case 'update':
        [...titleElements].map((titleElement) => {
          const spanElement = document.createElement('span')
          spanElement.classList.add('tocTitle')
          spanElement.innerText = titleElement.querySelector('.se-quote').innerText
          const tocElement = document.querySelector('.tocElement');
          tocElement.appendChild(spanElement)
        })
        break;
      case 'mount':
        document.querySelectorAll('.tocTitle').forEach((element) => {
          element.addEventListener('click', clickHandler);
        });
        break;
      case 'unmount':
        document.querySelectorAll('.tocTitle').forEach((element) => {
          element.removeEventListener('click', clickHandler);
        });
    }
  }

  function clickHandler(event) {
    const iframeElement = document.querySelector('#mainFrame') as HTMLIFrameElement

    const elementRect = event.target;
    iframeElement.scrollIntoView({ behavior: 'smooth' });
  }


  async function fetchCriterionObject() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'getCriterionObject' }, function (response) {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }

        const criterionObjectData = response.data;
        if (!criterionObjectData || !criterionObjectData.result) {
          reject("Invalid criterion object data");
          return;
        }

        const urlPath = window.location.pathname.split('/')[1];
        const urlMatched = criterionObjectData.result.find(criterionObject => criterionObject.url === urlPath);
        if (!urlMatched) {
          reject("URL not matched in criterion object data");
          return;
        }

        const criterionObject = urlMatched;
        setCriterionObject(criterionObject)
      });
    });
  }

  return null;
}
