import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import 'webextension-polyfill';

reloadOnUpdate('pages/background');
reloadOnUpdate('pages/content/style.scss');

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
