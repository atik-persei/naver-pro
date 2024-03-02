import { useEffect, useState } from 'react';
import ConfigManager from '@root/src/shared/storage/ConfigManager';

export default function App() {
  // 설정 데이터 구성
  const [configManager, setConfigManager] = useState(new ConfigManager());

  /*
  configManager.updateConfigManager({ GlobalApplicationScope: false })
  console.log(configManager.getConfigManager())
  */

  // toc 데이터 구성
  const [criterionObject, setCriterionObject] = useState(null);

  // 페이지 이동 시 조회
  useEffect(() => {
    document.querySelector('#mainFrame').addEventListener('load', fetchCriterionObject);
  }, []);

  useEffect(() => {
    // 초기 로딩
    if (criterionObject == null) {
      return
    }

    // iframe 블로그 본문 조회
    const iframeElement = document.querySelector('#mainFrame') as HTMLIFrameElement
    const iframeContent = iframeElement.contentDocument || iframeElement.contentWindow.document

    // toc 제목 조회
    console.log(criterionObject)
    const titleElements = criterionObject ? iframeContent.querySelectorAll(criterionObject.toc) : []

    // 선택된 blockquote 엘리먼트에 대한 작업 수행
    const filteredTitleElement = Array.from(titleElements).filter(element => {

      // 정규 표현식을 사용하여 단어 사이의 공백만 제거하고 길이를 계산
      const textWithoutExtraSpaces = element.textContent.replace(' ', '').trim();
      return textWithoutExtraSpaces.length <= 200;
    });

    // toc 업데이트
    tocElementUpdate(iframeContent, filteredTitleElement)
  }, [criterionObject])

  async function fetchCriterionObject() {
    setCriterionObject('loading')
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'getCriterionObject' }, function (response) {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }

        // 데이터 조회 성공 여부 확인
        const criterionObjectData = response.data;
        if (!criterionObjectData || !criterionObjectData.result) {
          reject('Invalid criterion object data');
          return;
        }

        // 필요 데이터 추출
        const urlPath = window.location.pathname.split('/')[1];
        const isSpecifiedBlog = criterionObjectData.result.find(criterionObject => criterionObject.url === urlPath) ? true : false;

        // 해당 블로그 설정이 있다면 데이터 반환
        if (isSpecifiedBlog) {
          setCriterionObject(criterionObjectData.result.find(criterionObject => criterionObject.url === urlPath))
          return
        }

        // 해당 블로그 설정이 없고, 전역 디폴트가 있다면 데이터 반환
        if (!isSpecifiedBlog && configManager.getConfigManager().GlobalApplicationScope) {
          setCriterionObject(criterionObjectData.default)
          return
        }

        // 블로그 설정, 전역 디폴트가 없다면 데이터 반환
        setCriterionObject('none')
        return
      });
    });
  }

  function tocElementInit(iframeContent) {
    // link 요소 생성 및 확장프로그램의 로컬 CSS 파일 추가
    const linkElement = iframeContent.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.type = 'text/css';
    linkElement.href = chrome.runtime.getURL('/assets/css/tocStyle.css');

    // head에 link 요소 추가
    iframeContent.head.insertBefore(linkElement, iframeContent.head.children[0]);

    // 게시글 요소 조회
    const documentBodyElement = iframeContent.querySelector('.se-viewer');

    // 자식 요소 생성 및 추가
    const createTocElement = document.createElement('div');
    createTocElement.classList.add('tocElement', 'se-component-content');

    // 제목과 본문 사이에 요소 추가
    documentBodyElement.insertBefore(createTocElement, documentBodyElement.children[1]);
  }

  function tocElementUpdate(iframeContent, titleElements) {
    let tocElement = iframeContent.querySelector('.tocElement');

    // 내용 초기화
    if (tocElement) {
      // 모든 자식 요소 삭제
      while (tocElement.firstChild) {
        tocElement.removeChild(tocElement.firstChild);
      }
    }

    if (!tocElement) {
      // link 요소 생성 및 확장프로그램의 로컬 CSS 파일 추가
      const linkElement = iframeContent.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.type = 'text/css';
      linkElement.href = chrome.runtime.getURL('/assets/css/tocStyle.css');

      // head에 link 요소 추가
      iframeContent.head.insertBefore(linkElement, iframeContent.head.children[0]);

      // 게시글 요소 조회
      const documentBodyElement = iframeContent.querySelector('.se-viewer');

      // 자식 요소 생성 및 추가
      const createTocElement = document.createElement('div');
      createTocElement.classList.add('tocElement', 'se-component-content');

      // 제목과 본문 사이에 요소 추가
      documentBodyElement.insertBefore(createTocElement, documentBodyElement.children[1]);

      tocElement = iframeContent.querySelector('.tocElement');
    }

    if (criterionObject == 'loading') {
      const spanElement = document.createElement('p');
      spanElement.classList.add('tocTitle');
      spanElement.innerText = '목차를 불러오는 중입니다.';
      tocElement.appendChild(spanElement);
      return
    }

    if (criterionObject == 'none') {
      const spanElement = document.createElement('p');
      spanElement.classList.add('tocTitle');
      spanElement.innerText = '지정된 블로그가 아닙니다.';
      tocElement.appendChild(spanElement);
      return
    }


    if (titleElements.length > 0) {
      titleElements.map((titleElement) => {
        const spanElement = document.createElement('span');
        spanElement.classList.add('tocTitle');
        spanElement.innerText = '• ' + titleElement.querySelectorAll('p')[0].textContent;
        spanElement.addEventListener('click', () => clickHandler(titleElement));

        tocElement.appendChild(spanElement);
      })

      return
    }

    if (titleElements.length == 0) {
      const spanElement = document.createElement('p');
      spanElement.classList.add('tocTitle');
      spanElement.innerText = '목차가 없습니다.';
      tocElement.appendChild(spanElement);
      return
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

  return null
}