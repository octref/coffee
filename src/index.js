const WORKER_URL = 'https://github-oauth-login.octref.workers.dev'
const OWNER_ID = 'octref'

go()

async function go() {
  overrideFormSubmit()

  const code = getParam(window.location.href, 'code')
  if (code) {
    const newURL = removeParam(window.location.href, 'code')
    history.replaceState({}, '', newURL)
  }

  if (
    localStorage.getItem('login') === OWNER_ID &&
    localStorage.getItem('token')
  ) {
    setLoginUI()
    return
  }

  const getTokenResponse = await fetch(WORKER_URL, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({ code })
  })

  const result = await getTokenResponse.json()

  if (result.error) {
    return console.error(JSON.stringify(result, null, 2))
  }

  const getUserResponse = await fetch('https://api.github.com/user', {
    headers: {
      accept: 'application/vnd.github.v3+json',
      authorization: `token ${result.token}`
    }
  })
  const { login } = await getUserResponse.json()

  if (login === OWNER_ID && result.token) {
    localStorage.setItem('token', result.token)
    localStorage.setItem('login', login)
    setLoginUI()
  }
}

function overrideFormSubmit() {
  const $form = document.querySelector('#coffee-form')

  $form.addEventListener('submit', async (ev) => {
    ev.preventDefault()
    const formData = new FormData($form)
    const jsonData = {}

    for (const [key, value] of formData.entries()) {
      jsonData[key] = value
    }

    if (
      !(
        localStorage.getItem('login') === OWNER_ID &&
        localStorage.getItem('token')
      )
    ) {
      return alert(`you aren't pine. stop it`)
    }

    console.log(jsonData)

    const dispatchResponse = await fetch(
      'https://api.github.com/repos/octref/coffee/dispatches',
      {
        method: 'POST',
        headers: {
          accept: 'application/vnd.github.v3+json',
          authorization: `token ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          event_type: 'add-coffee',
          client_payload: jsonData
        })
      }
    )

    if (dispatchResponse.ok) {
      console.log('coffee added!')
    }
  })
}

function setLoginUI() {
  const $login = document.querySelector('#login')
  $login.dataset.state = 'logged-in'
}

function getParam(url, param) {
  return new URL(url).searchParams.get(param)
}

function removeParam(url, param) {
  const urlObject = new URL(url)
  const searchParams = new URLSearchParams(urlObject.search)

  searchParams.delete(param)
  urlObject.search = searchParams.toString()

  return urlObject.href
}
