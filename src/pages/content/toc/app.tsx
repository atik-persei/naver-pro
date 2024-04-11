import { useEffect, useState } from 'react';
import useStorage from '@root/src/shared/hook/useStorage';
import configStorage from '@root/src/shared/storage/configStorage';

type PageStructure = null | 'iframe' | 'static' | 'none';

export default function App() {
  // 설정 데이터 구성
  const configManager = useStorage(configStorage);

  // toc 데이터 구성
  const [criterionObject, setCriterionObject] = useState(null);

  // 페이지 형태 분류
  const [pageStructure, setPageStructure] = useState<PageStructure>(null);
  const [blogID, setBlogID] = useState(null);

  // 페이지 이동 시 구분
  useEffect(() => {
    const iframeElement = document.querySelector('#mainFrame');
    const viwerElement = document.querySelector('.se-viewer') || document.querySelector('.se_component_wrap');
    setPageStructure(iframeElement ? 'iframe' : viwerElement ? 'static' : 'none');
  }, []);

  useEffect(() => {
    console.log(`pageStructre: ${pageStructure}`)

    // 초기 로딩
    if (pageStructure == null) {
      return
    }

    if (pageStructure == 'none') {
      return
    }

    if (pageStructure == 'static') {
      fetchCriterionObject();
      return;
    }

    if (pageStructure == 'iframe') {
      const intervalId = setInterval(() => {
        // 특정 조건을 만족하면 setInterval 종료
        const mainFrame = document.querySelector('#mainFrame') as HTMLIFrameElement
        // 페이지 이동 시 감지
        document.querySelector('#mainFrame').addEventListener('load', () => {
          fetchCriterionObject();
          clearInterval(intervalId);
        });

        // 페이지 복구 시 감지
        if (mainFrame.contentWindow.document.readyState === 'complete') {
          fetchCriterionObject();
          clearInterval(intervalId);
        } 
      }, 1000);
      return;
    }
  }, [pageStructure])

  useEffect(() => {
    // 초기 로딩
    if (criterionObject == null) {
      return
    }

    // iframe 블로그 본문 조회
    let iframeElement: HTMLIFrameElement | null = null
    let iframeContent: HTMLDocument | Document | null = null

    if (pageStructure == null) {
      return;
    }

    if (pageStructure == 'static') {
      iframeContent = document
    }

    if (pageStructure == 'iframe') {
      iframeElement = document.querySelector('#mainFrame') as HTMLIFrameElement
      iframeContent = iframeElement.contentDocument || iframeElement.contentWindow.document
    }


    // toc 제목 조회
    console.log(criterionObject)
    const titleElements = criterionObject ? iframeContent.querySelectorAll(criterionObject.toc) : []

    // 선택된 blockquote 엘리먼트에 대한 작업 수행
    const filteredTitleElement = Array.from(titleElements).filter(element => {

      // 정규 표현식을 사용하여 단어 사이의 공백만 제거하고 길이를 계산
      const textWithoutExtraSpaces = element?.textContent.replace(' ', '').trim();
      return textWithoutExtraSpaces.length > 0 && textWithoutExtraSpaces.length <= 200 && textWithoutExtraSpaces != '​';
    });

    // toc 업데이트
    tocElementUpdate(iframeContent, filteredTitleElement)
  }, [criterionObject])

  async function fetchCriterionObject() {
    // 목차 보여주기 여부
    if (!configManager.Toc) { return }

    // 블로그 아이디 임시 기록
    let blogID = ''

    setCriterionObject('loading')

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'getCriterionObject' }, async function (response) {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }

        // 데이터 조회 성공 여부 확인
        const criterionObjectData = response.data;
        if (!criterionObjectData || !criterionObjectData.result) {
          setCriterionObject('update')
          reject('Invalid criterion object data');
          return;
        }

        // 필요 데이터 추출
        if (pageStructure == 'static') {
          // 현재 URL의 search 파라미터를 가져오기
          const urlParams = new URLSearchParams(window.location.search);

          // 블로그 아이디 조회
          blogID = urlParams.get('blogId');
        }

        if (pageStructure == 'iframe') {
          // 블로그 아이디 조회
          blogID = window.location.pathname.split('/')[1];
        }

        // 블로그 아이디 저장
        setBlogID(blogID)

        // 블로그 설정 데이터 유무
        const isSpecifiedBlog = criterionObjectData.result.find(criterionObject => criterionObject.url === blogID) ? true : false;

        // 해당 블로그 설정이 있다면 데이터 반환
        if (isSpecifiedBlog) {
          setCriterionObject(criterionObjectData.result.find(criterionObject => criterionObject.url === blogID))
          return
        }

        // 해당 블로그 설정이 없고, 전역 디폴트가 있다면 데이터 반환
        if (!isSpecifiedBlog && configManager.TocGlobalApplicationScope) {
          setCriterionObject({ toc: configManager.TocDeafultTag })
          return
        }

        // 블로그 설정, 전역 디폴트가 없다면 데이터 반환
        setCriterionObject('none')
        return
      });
    });
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
      const documentBodyElement = iframeContent.querySelector('.se-viewer') || iframeContent.querySelector('.se_component_wrap');

      // 자식 요소 생성 및 추가
      const createTocElement = document.createElement('div');
      createTocElement.classList.add('tocElement', 'se-component-content');

      // 제목과 본문 사이에 요소 추가
      documentBodyElement.insertBefore(createTocElement, documentBodyElement.children[1]);

      tocElement = iframeContent.querySelector('.tocElement');
    }

    // 목차 데이터를 불러오는 과정
    if (criterionObject == 'loading') {
      const spanElement = document.createElement('p');
      spanElement.classList.add('tocTitle');
      spanElement.innerText = '목차를 불러오는 중입니다.';
      tocElement.appendChild(spanElement);
      return
    }

    // 지정된 블로그가 아닌 경우
    if (criterionObject == 'none') {
      const spanElement = document.createElement('p');
      spanElement.classList.add('tocTitle');
      spanElement.innerText = '지정된 블로그가 아닙니다.';
      tocElement.appendChild(spanElement);
      return
    }

    // API 업데이트로 인한 동작이 불가능 한 경우
    if (criterionObject == 'update') {
      const spanElement = document.createElement('p');
      spanElement.classList.add('tocTitle');
      spanElement.innerText = '확장 프로그램 업데이트가 필요합니다.';
      tocElement.appendChild(spanElement);
      return
    }

    // 조회된 목차 데이터가 있을 경우
    if (titleElements.length > 0) {
      titleElements.map((titleElement) => {
        const spanElement = document.createElement('span');
        spanElement.classList.add('tocTitle');

        if (configManager.TocDeafultTag == 'blockquote') {
          // console.log(replaceTitle(titleElement.querySelectorAll('p')[0]?.textContent))
          spanElement.innerText = '• ' + replaceTitle(titleElement.querySelectorAll('p')[0]?.textContent);
        }

        if (configManager.TocDeafultTag == 'b') {
          // console.log(replaceTitle(titleElement?.textContent))
          spanElement.innerText = '• ' + replaceTitle(titleElement?.textContent);
        }

        spanElement.addEventListener('click', () => clickHandler(titleElement));

        tocElement.appendChild(spanElement);
      })

      return
    }

    // 조회된 목차 데이터가 없을 경우
    if (titleElements.length == 0) {
      const spanElement = document.createElement('p');
      spanElement.classList.add('tocTitle');
      spanElement.innerText = '목차가 없습니다.';
      tocElement.appendChild(spanElement);
      return
    }
  }

  function clickHandler(titleElement: HTMLElement) {
    let iframeElement: HTMLIFrameElement | HTMLElement | null = null;

    if (pageStructure == 'static') {
      iframeElement = document.querySelector('body') as HTMLElement;
    }

    if (pageStructure == 'iframe') {
      iframeElement = document.querySelector('#mainFrame') as HTMLIFrameElement;
    }

    // 클릭한 엘리먼트의 위치 정보를 가져옵니다.
    const clickedElementRect = titleElement.getBoundingClientRect();

    if (iframeElement instanceof HTMLIFrameElement && iframeElement.contentWindow) {
      // iframe 내부의 document 조회
      iframeElement.contentWindow.scrollTo({
        top: iframeElement.contentWindow.scrollY + clickedElementRect.top - 58,
        behavior: 'smooth',
      });
    } else {
      // iframeElement가 HTMLIFrameElement가 아닌 경우 또는 contentWindow가 없는 경우
      window.scrollTo({
        top: window.scrollY + clickedElementRect.top - 58,
        behavior: 'smooth',
      });
    }
  }

  function replaceTitle(text) {
    const replaceText = text.trim().replaceAll('                                ', '').replaceAll('\n', ' ')
    return replaceText;
  }

  return null
}