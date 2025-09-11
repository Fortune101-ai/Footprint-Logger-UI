document.addEventListener('DOMContentLoaded',()=>{

    const loginForm = document.getElementById("loginForm");
    const messageElement = document.createElement('p');
    messageElement.className = "form-message";
    
    loginForm.addEventListener('submit',async(e)=>{
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        messageElement.textContent = '';

        if (!email|| !password){
            messageElement.style.color = 'red';
            messageElement.textContent = 'Please fill in all fields.';
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/login',{
                method:"POST",
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({email,password})
            });

            const data = await response.json();

            if (response.ok) {
                messageElement.style.color = 'green';
                messageElement.textContent = data.message || 'Login successful! Redirecting to dashboard...';
                loginForm.appendChild(messageElement);
                localStorage.setItem('token',data.token);
                setTimeout(()=>{
                    window.location.href = 'dashboard.html';
                },2000);
            }else {
                messageElement.style.color = 'red';
                messageElement.textContent = data.message || 'Login failed. Please try again.';
                loginForm.appendChild(messageElement);
            }
        }catch (error) {
            console.error('Error:',error);
            messageElement.style.color = 'red';
            messageElement.textContent = 'An error occurred. Please try again later.';
            loginForm.appendChild(messageElement);
        }

    })

})