import { showAlert } from './alert';

export const updateSettings = async (data, type) => {
  const dt = { ...data };
  try {
    console.log(dt);
    let url = 'http://127.0.0.1:3000/api/v1/users/';
    url += type === 'password' ? 'updatePassword' : 'updateData';
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(dt),
    });
    if (!res.ok) throw res;
    const updatedUser = await res.json();
    if (updatedUser.status === 'success') {
      showAlert('success', `Update User ${type} successfully `);
    }
  } catch (err) {
    err.text().then((errmsg) => {
      const msg = JSON.parse(errmsg);
      showAlert('error', msg);
    });
  }
};
