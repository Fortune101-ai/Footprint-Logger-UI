document.addEventListener('DOMContentLoaded',()=>{

    const registerForm = document.getElementById('registerForm');
    const messageElement = document.createElement('p');
    messageElement.className = "form-message";

    registerForm.addEventListener('submit',async(e)=>{
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        messageElement.textContent = '';

        if (!username || !email || !password) {
            messageElement.textContent = 'Please fill in all fields.';
            registerForm.appendChild(messageElement);
            return;
        }

        if (password.length < 8) {
            messageElement.style.color='red';
            messageElement.textContent = 'Password mst be at least 8 characters long.';
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/register',{
                method:"POST",
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({username,email,password})
            });

            const data = await response.json();

            if (response.ok){
                messageElement.style.color='green';
                messageElement.textContent = data.message || 'Registration successful! Redirecting to login...';
                setTimeout(()=>{
                    window.location.href = 'login.html';
                }, 2000);
            }else {
                messageElement.style.color='red';
                messageElement.textContent = data.message || 'Registration failed. Please try again.';
            }

        }catch (error) {
            console.error('Error:',error);
            messageElement.style.color='red';
            messageElement.textContent = 'An error occurred. Please try again later.';
        }
    })

})