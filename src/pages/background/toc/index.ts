import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import 'webextension-polyfill';

reloadOnUpdate('pages/background');
reloadOnUpdate('pages/content/style.scss');


chrome.tabs.onCreated.addListener((tab) => {
  // 새로운 탭이 생성될 때
  chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo, updatedTab) {
    if (tabId === tab.id && changeInfo.status === 'complete') {
      // 해당 탭의 로딩이 완료되었을 때
      chrome.tabs.sendMessage(tabId, { message: 'hello' });
      // 이벤트 리스너를 제거합니다.
      chrome.tabs.onUpdated.removeListener(listener);
    }
  });
});

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.action === 'getCriterionObject') {
      // fetchData 함수를 Promise로 감싸기
      async function fetchCriterionObject() {
        try {
          const response = await fetch(`https://aiaczbgnw7e3ek2jccxg23moo40mltvm.lambda-url.ap-northeast-2.on.aws`);
          const result = await response.json();
          return result;
        } catch {
          return 'update'
        }
      }

      // fetchData 호출 후 sendResponse 호출
      fetchCriterionObject().then(data => {
        sendResponse({ data });
      }).catch(error => {
        console.error('Error fetching data:', error);
        sendResponse({ error });
      });

      // sendResponse를 사용하기 위해 true 반환
      return true;
    }
  }
);
