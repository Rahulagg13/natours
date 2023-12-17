import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await fetch('/api/v1/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    console.log(res.ok);
    if (!res.ok) throw new Error(showAlert('error', 'Error While Logging in'));

    const data = await res.json();

    if (data.status === 'success') {
      showAlert('success', 'You are successfully logged in');
      window.setTimeout(() => {
        location.assign('/');
      }, 200);
    }
    console.log(data);
  } catch (err) {
    showAlert('error', 'somethimg went wrong while logging in');
    // err.text().then((errmsg) => {
    //   const msg = JSON.parse(errmsg);
    //   // showAlert('error', msg.message);
    // });
  }
};

export const logout = async () => {
  try {
    const res = await fetch('/api/v1/users/logout', {
      method: 'GET',
    });
    if (!res.ok) throw new Error(showAlert('error', 'Error while logout'));
    const data = await res.json();
    if (data.status === 'success') {
      showAlert('success', 'You are successfully logged out');
      location.assign('/');
    }
  } catch (err) {
    showAlert('error', 'somethimg went wrong while logout');
  }
};
