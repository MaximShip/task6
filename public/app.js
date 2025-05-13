let currentTheme = localStorage.getItem('theme') || 'light';
document.body.setAttribute('data-theme', currentTheme);

async function handleRegister(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const username = formData.get('username');
  const password = formData.get('password');

    if (!username || !password) {
        alert("Вы не ввели имя или пароль");
        return false;
    }

  try {
    const response = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });

    if (!response.ok) {
        throw new Error("Ошибка при регистрации");
    }

    const data = await response.json();


    alert('Регистрация прошла успешно');
    event.target.reset();
  } catch (error) {
    alert(error.message);
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: formData.get('username'),
        password: formData.get('password')
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    await loadProfile();
    event.target.reset();
  } catch (error) {
    alert(error.message);
  }
}

async function loadProfile() {
  try {
    const response = await fetch('/profile');
    if (!response.ok) {
      if (response.status === 401) {
        document.getElementById('auth-forms').style.display = 'block';
        document.getElementById('profile-page').style.display = 'none';
        return;
      }
      throw new Error('Ошибка при загрузке профиля');
    }
    const data = await response.json();
    document.getElementById('username').textContent = data.username;
    document.getElementById('auth-forms').style.display = 'none';
    document.getElementById('profile-page').style.display = 'block';
    await fetchData();
  } catch (error) {
    alert(error.message);
  }
}

async function handleLogout() {
  try {
    const response = await fetch('/logout', { method: 'POST' });
    if (!response.ok) throw new Error('Ошибка при выходе из аккаунта');
    document.getElementById('auth-forms').style.display = 'block';
    document.getElementById('profile-page').style.display = 'none';
  } catch (error) {
    alert(error.message);
  }
}

async function fetchData() {
  try {
    const response = await fetch('/data');
    if (!response.ok) throw new Error('Ошибка получения данных');
    const data = await response.json();
    document.getElementById('data-display').textContent = 
      JSON.stringify(data, null, 2);
  } catch (error) {
    alert(error.message);
  }
}

function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.body.setAttribute('data-theme', currentTheme);
  localStorage.setItem('theme', currentTheme);
}

document.addEventListener('DOMContentLoaded', function() {

    const loginForm = document.getElementById('login-form-element');  
    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }
    
    const registerForm = document.getElementById('register-form-element');
    if (registerForm) {
      registerForm.addEventListener('submit', handleRegister);
    }

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', handleLogout);
    }

    const refreshButton = document.getElementById('refresh-button');
    if (refreshButton) {
      refreshButton.addEventListener('click', fetchData);
    }
  
    const themeToggle = document.getElementById('theme-switcher');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }

    loadProfile();
})