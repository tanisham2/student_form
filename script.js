console.log("JS Connected");

const form = document.getElementById("studentForm");

form.addEventListener("submit", async function(e) {
    e.preventDefault();
    const formData = new FormData(form);
    console.log("Form Submitted");

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();

    const genderInput = document.querySelector('input[name="gender"]:checked');
    const gender = genderInput ? genderInput.value : "";

    const checkedCourses = document.querySelectorAll('input[name="courses[]"]:checked');
    const courses = Array.from(checkedCourses).map(cb => cb.value);

    if (!name) {
        alert("Name is required.");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        alert("Enter a VALID email address.");
        return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phone || !phoneRegex.test(phone)) {
        alert("Enter a VALID 10-digit phone number.");
        return;
    }

    if (!gender) {
        alert("Select a gender.");
        return;
    }

    if (checkedCourses.length === 0) {
        alert("Select at least one course.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/submit", {
            method: "POST",
            body: formData
        });

        const result = await response.text();
        alert(result);
        form.reset();

    } 
    catch(error) {
        console.log("Fetch error:", error);
        alert("Something is Wrong. Check console.");
    }
});
