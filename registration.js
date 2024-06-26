
const PATTERNS = {
    email: {
        pattern: /^[A-Za-z0-9]+([_\.\-][A-Za-z0-9]+)*@([A-Za-z0-9]+-?[A-Za-z0-9]+)+(\.[a-z]{2,3}){1,2}$/,
        error: 'Invalid email format. Must follow: [username]@[domain].',
    },

    password: {
        pattern: /^(?=.*[A-Z])(?=.*\d).*$/,
        error: 'Must contain an uppercase letter, and a digit.',
    },
}

const LENGTHS = {
    password: {
        min: 8,
        error: 'Must contain at least 8 characters',
    }
}

const formContainer = document.querySelector('.form-container')
const inputFields = document.querySelectorAll('input, select')
const submissionError = document.querySelector('.submission-error')
const submitBtn = document.querySelector('#submit')

const errorMessages = {}

inputFields.forEach(field => {
    errorMessages[field.name] = {}

    if (field.hasAttribute('data-required')) {
        errorMessages[field.name].requirementValidation = 'This field is required.'
    }

    if (field.hasAttribute('data-pattern')) {
        errorMessages[field.name].patternValidation = PATTERNS[field.name].error
    }

    if (field.hasAttribute('data-length')) {
        errorMessages[field.name].lengthValidation = LENGTHS[field.name].error

        if ('max' in LENGTHS[field.name]) {
            field.addEventListener('input', () => field.value = field.value.slice(0, LENGTHS[field.name].max))
        }
    }

    field.addEventListener('input', () => {
        field.classList.remove('error-field')
        errorSpan = document.querySelector(`#${field.id} + .error-span`)
        errorSpan.textContent = ''
    })
})


let submitted = false

formContainer.addEventListener('submit', e => {
    e.preventDefault()

    if (!submitted && validateForm()) {
        submitted = true

        postForm(formContainer.querySelector('form')).then(() => {
            submitted = false
        })
    }

    window.scrollTo(0, 50)
})

async function postForm(formElement) {
    const formData = Object.fromEntries((new FormData(formElement)).entries())

    submitBtn.disabled = true
    const resText = await fetch('http://localhost:3000/api/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
    })
        .then(response => {
            if (response.ok) {
                uploadImg()
                window.location.replace('http://localhost:3000/login.html')

            } else {
                submitBtn.disabled = false
                return response.text()
            }
        }).then(text => text)

    if (resText) {
        submissionError.textContent = resText
        submissionError.style.display = 'block'
        window.scrollTo(0, 0)
    }

}

function uploadImg() {
    const imgField = document.querySelector('#profile-img')
    if (imgField.files.length) {
        const formData = new FormData()
        formData.append('file', imgField.files[0])

        fetch('http://localhost:3000/api/profile/image', {
            method: 'POST',
            body: formData,
        })
    }
}

function validateForm() {
    let isValid = true

    inputFields.forEach(field => {
        if (!validateInput(field)) {
            isValid = false
        }
    })

    return isValid
}

function validateInput(field) {
    let isValid = false
    let errorMessage

    if ('requirementValidation' in errorMessages[field.name] && !requirementValidation(field)) {
        errorMessage = errorMessages[field.name].requirementValidation
    } else if ('lengthValidation' in errorMessages[field.name] && !lengthValidation(field)) {
        errorMessage = errorMessages[field.name].lengthValidation
    } else if ('patternValidation' in errorMessages[field.name] && !patternValidation(field)) {
        errorMessage = errorMessages[field.name].patternValidation
    } else if (field.id === 'retyped-password' && !passwordsMatch()) {
        errorMessage = 'Passwords do not match'
    } else {
        isValid = true
    }

    if (!isValid) {
        field.classList.add('error-field')
        errorSpan = document.querySelector(`#${field.id} + .error-span`)
        errorSpan.style.display = 'block'
        errorSpan.textContent = errorMessage
    }

    return isValid
}

function requirementValidation(field) {
    return field.value !== ''
}

function patternValidation(field) {
    return PATTERNS[field.name].pattern.test(field.value)
}

function lengthValidation(field) {
    return 'min' in LENGTHS[field.name] ? field.value.length >= LENGTHS[field.name].min : false
}

function passwordsMatch() {
    return document.querySelector('#password').value === document.querySelector('#retyped-password').value
}