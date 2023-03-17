const unlockProvider = (inputParameters) => {
  const spinner = document.getElementById('spinner');
  const button = document.getElementById('unlockButton');
  const successMessage = document.getElementById('successMessage');
  const secretTextInput = document.getElementById('secret');
  const secretDiv = document.getElementById('secretDiv');
  const secret = secretTextInput.value;

  const { token, parameterCacheId, extendedClaim } = inputParameters;

  spinner.style.visibility = 'visible';
  button.style.visibility = 'hidden';

  // setTimeout is simply to show spinner - remove if sent to provider
  setTimeout(() => {
    const data = JSON.stringify({
      token,
      secret,
      parameterCacheId,
      extendedClaim,
    });

    const httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = () => {
      spinner.style.visibility = 'hidden';

      if (!(httpRequest.readyState === 4 && httpRequest.status === 201)) {
        return;
      }

      const responseText = httpRequest.responseText.replace(/'/gi, '');

      if (responseText === 'active') {
        secretTextInput.style.visibility = 'hidden';
        secretDiv.style.visibility = 'hidden';
        successMessage.style.visibility = 'visible';
      } else {
        button.style.visibility = 'visible';
      }

      updateParent(responseText);
    };

    httpRequest.open('POST', inputParameters.url, true);
    httpRequest.setRequestHeader(
      'Content-Type',
      'application/json; charset=UTF-8',
    );
    httpRequest.setRequestHeader(
      'Authorization',
      `AccessToken ${extendedClaim}`,
    );
    httpRequest.send(data);
  }, 1000);
};

const updateParent = (message) => {
  const target = window.parent;
  target.postMessage(message, '*');
};
