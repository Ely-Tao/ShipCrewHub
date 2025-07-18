// 在浏览器控制台运行此代码来设置临时认证
function setTestAuth() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1Mjc5OTUwMiwiZXhwIjoxNzUyODg1OTAyfQ.bCeM4y3d9EM6hXVWVg4Bz27xwuuiIYd8f33K5SHdcwE';
  const user = {
    id: 1,
    username: 'admin',
    email: 'admin@shipcrewdb.com',
    role: 'admin',
    status: 'active'
  };
  
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  console.log('测试认证已设置');
  
  // 刷新页面
  window.location.reload();
}

// 如果需要，运行: setTestAuth()
console.log('运行 setTestAuth() 来设置测试认证');
