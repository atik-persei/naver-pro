import { useEffect, useState } from 'react';

export default function App() {
  // toc 분류 데이터
  const [criterionObject, setCriterionObject] = useState(null);

  // 페이지 이동 시 조회
  useEffect(() => {
    document.querySelector('#mainFrame').addEventListener('load', fetchCriterionObject);
  }, []);

  // toc 분류 데이터 업데이트 시 동작
  useEffect(() => {
    // toc 분류 데이터 존재 유무 확인
    if (criterionObject == null) { return; }

    // iframe 블로그 본문 조회
    const iframeElement = document.querySelector('#mainFrame') as HTMLIFrameElement
    const iframeContent = iframeElement.contentDocument || iframeElement.contentWindow.document

    // toc 제목 조회
    const titleElements = iframeContent.querySelectorAll(criterionObject.toc)

    // toc 업데이트
    tocElementController('update', titleElements)
  }, [criterionObject])

  function tocElementController(type, titleElements?) {
    const mainFrame = document.querySelector('#mainFrame');

    switch (type) {
      case 'init':
        if (mainFrame instanceof HTMLIFrameElement) {
          // iframe 내부의 document 조회
          const iframeDocument = mainFrame.contentDocument || mainFrame.contentWindow.document;

          // link 요소 생성 및 확장프로그램의 로컬 CSS 파일 추가
          var linkElement = iframeDocument.createElement('link');
          linkElement.rel = 'stylesheet';
          linkElement.type = 'text/css';
          linkElement.href = chrome.runtime.getURL('/assets/css/tocStyle.css');

          // head에 link 요소 추가
          iframeDocument.head.insertBefore(linkElement, iframeDocument.head.children[0]);

          // 게시글 요소 조회
          const documentBodyElement = iframeDocument.querySelector('.se-viewer');

          // 자식 요소 생성 및 추가
          const createTocElement = document.createElement('div');
          createTocElement.classList.add('tocElement', 'se-component-content');

          // 제목과 본문 사이에 요소 추가
          documentBodyElement.insertBefore(createTocElement, documentBodyElement.children[1]);
        }
        break;
      case 'update':
        if (mainFrame instanceof HTMLIFrameElement) {
          // iframe 내부의 document 조회
          const iframeDocument = mainFrame.contentDocument || mainFrame.contentWindow.document;

          // toc 요소 조회
          const tocElement = iframeDocument.querySelector('.tocElement');

          // 인자 검사
          if (!titleElements) { return }

          // 목차 요소 추가
          if ([...titleElements].length == 0) {
            // 검색된 목차가 없을 경우
            const spanElement = document.createElement('p')
            spanElement.classList.add('tocTitle')
            spanElement.innerText = '목차가 없습니다.'
            tocElement.appendChild(spanElement)
          } else {
            // 검색된 목차가 있을 때
            [...titleElements].map((titleElement) => {
              const spanElement = document.createElement('span')
              spanElement.classList.add('tocTitle')
              spanElement.innerText = '• ' + titleElement.querySelector('.se-quote').innerText
              spanElement.addEventListener('click', () => clickHandler(titleElement));

              tocElement.appendChild(spanElement)
            })
          }
        }
        break;
    }
  }

  function clickHandler(titleElement) {
    // iframe 내부의 document 조회
    const iframeElement = document.querySelector('#mainFrame') as HTMLIFrameElement;

    // 클릭한 엘리먼트의 위치 정보를 가져옵니다.
    const clickedElementRect = titleElement.getBoundingClientRect();

    // iframe 내의 엘리먼트를 찾아서 해당 엘리먼트의 위치로 스크롤합니다. (네이버 해더 제외)
    iframeElement.contentWindow.scrollTo({
      top: iframeElement.contentWindow.scrollY + clickedElementRect.top - 58,
      behavior: 'smooth'
    });
  }


  async function fetchCriterionObject() {
    // TOC 인터페이스 생성
    tocElementController('init')

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
