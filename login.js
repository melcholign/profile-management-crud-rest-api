const submitBtn = document.querySelector('#submit')
const emailField = document.querySelector('#email')
const passwordField = document.querySelector('#password')
const submissionError = document.querySelector('.submission-error')

emailField.addEventListener('input', () => removeFieldError(emailField))
passwordField.addEventListener('input', () => removeFieldError(passwordField))

submitBtn.addEventListener('click', e => {
    e.preventDefault()

    if (validateForm()) {

        submitBtn.disabled = true
        submissionError.style.display = 'none'
        let ok = false;

        (async () => {

            submissionError.textContent = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: emailField.value,
                    password: passwordField.value,
                })
            })
                .then(res => {

                    if (res.ok) {
                        ok = true
                        window.location.replace('http://localhost:3000/')
                    }

                    return res.text()
                })

            if (!ok) {
                submissionError.style.display = 'block'
                submitBtn.disabled = false
            }

        })()
    }
})

function validateForm() {

    let isValid = true

    if (!requirementValidation(emailField)) {
        addFieldError(emailField, 'This field is required.')
        isValid = false
    }

    if (!requirementValidation(passwordField)) {
        addFieldError(passwordField, 'This field is required.')
        isValid = false
    }

    return isValid
}

function removeFieldError(field) {
    field.classList.remove('error-field')
    errorSpan = document.querySelector(`#${field.id} + .error-span`)
    errorSpan.style.display = 'none'
}

function addFieldError(field, errorMessage) {
    field.classList.add('error-field')
    errorSpan = document.querySelector(`#${field.id} + .error-span`)
    errorSpan.style.display = 'block'
    errorSpan.textContent = errorMessage
}

function requirementValidation(field) {
    return field.value !== ''
}


