const editBtn = document.querySelector('#edit')
const deleteBtn = document.querySelector('#delete')
const logoutBtn = document.querySelector('#logout')
const uploadImgBtn = document.querySelector('#upload-btn')

const profileImg = document.querySelector('.img-container img')

// form elements
const profileContainer = document.querySelector('.profile-container')
const infoForm = profileContainer.querySelector('.info-container')
const firstNameField = infoForm.querySelector('#first-name')
const lastNameField = infoForm.querySelector('#last-name')
const dateOfBirthField = infoForm.querySelector('#date-of-birth')
const genderField = infoForm.querySelector('#gender')
const imgField = document.querySelector('#img-upload')
const infoInputs = [firstNameField, lastNameField, dateOfBirthField, genderField]
// modal dialogs
const booleanDialog = document.querySelector('dialog.boolean')
const loaderDialog = document.querySelector('dialog.loader')

firstNameField.addEventListener('input', () => removeFieldError(firstNameField))
lastNameField.addEventListener('input', () => removeFieldError(lastNameField))

document.addEventListener('DOMContentLoaded', async () => {

    loaderDialog.querySelector('p').textContent = 'Loading Profile..'
    loaderDialog.showModal()

    const profileInfo = await fetch('http://localhost:3000/api/profile', {
        Accept: 'application/json',
    })
        .then(res => {
            if (!res.ok) {
                window.location.replace('./login.html')
            }

            setTimeout(() => {
                loaderDialog.close()
            }, 1000)

            const output = res.json()
            return output
        })

    firstNameField.value = profileInfo.first_name
    lastNameField.value = profileInfo.last_name
    dateOfBirthField.value = profileInfo.date_of_birth
    genderField.value = profileInfo.gender
    
    if(profileInfo.profileImgSrc) {
        profileImg.src = profileInfo.profileImgSrc
        profileImg.style.visibility = 'visible'
    }

})

// stores the original values of the fields before any modification has been made to them during editing mode
const originalInfo = {}
// stores the modified values of the fields before the update is applied
const updatedInfo = {}

// indicates editing mode
let editing = false

editBtn.addEventListener('click', e => {

    // enter edit mode
    if (!editing) {
        enterEditMode()
        editing = true

    } else {

        // before exiting edit mode
        if (!validateForm())
            return

        (async () => {
            // if any field has been changed, update its corresponding record at the server
            if (Object.keys(updatedInfo).length != 0) {
                // disabling the buttons prevent any interaction while the asynchronous call to the server is processing
                editBtn.disabled = true
                deleteBtn.deleteBtn = true
                await serverSideUpdate()
            }

            exitEditMode()
            editBtn.disabled = false
            deleteBtn.deleteBtn = false
            editing = false

        })()
    }

})

deleteBtn.addEventListener('click', e => {

    // during editing mode, the delete button behaves as cancel button
    if (editing) {

        // if any field has been changed
        if (Object.keys(updatedInfo).length != 0) {

            // function to revert changed fields to their original value
            const revertInputs = () => {
                infoInputs.forEach(input => {
                    if (input.name in updatedInfo) {
                        input.value = originalInfo[input.name]
                    }
                })

                exitEditMode()
                editing = false
            }

            dialogBooleanEvent(revertInputs, null, 'Exit editing? You may lose the changes you made.')
        } else {

            exitEditMode()
            editing = false
        }

    } else {

        dialogBooleanEvent(deleteProfile, null, 'Do you confirm the deletion of your profile?')
    }

})

logoutBtn.addEventListener('click', () => {
    fetch('http://localhost:3000//api/logout', {
        method: 'POST'
    }).then(() => {
        window.location.replace('http://localhost:3000/login.html')
    })
})

uploadImgBtn.addEventListener('click', () => {
    imgField.click()
})

imgField.addEventListener('input', () => {
    const formData = new FormData()
    formData.append('file', imgField.files[0])

    profileImg.visibility = false
    fetch('http://localhost:3000/api/profile/image', {
        method: 'POST',
        body: formData,
    }).then(async res => {
        if(res.ok) {
            profileImg.visibility = false
            profileImg.src = await res.text()
            window.location.reload()
        }
    })
})

// runs functions based on the choice made in yes/no dialogs
function dialogBooleanEvent(onconfirm, oncancel, dialogText = 'Do you confirm', confirmText = 'Yes', cancelText = 'No') {
    booleanDialog.querySelector('p').textContent = dialogText

    confirmBtn = booleanDialog.querySelector('#confirm')
    confirmBtn.textContent = confirmText
    confirmBtn.addEventListener('click', async () => {
        await onconfirm()
        booleanDialog.close()
    })

    cancelBtn = booleanDialog.querySelector('#cancel')
    cancelBtn.textContent = cancelText
    cancelBtn.addEventListener('click', async () => {
        if (oncancel) await oncancel()
        booleanDialog.close()
    })

    booleanDialog.showModal()
}

booleanDialog.addEventListener('close', () => {
    // remove event listeners on the dialog buttons by cloning and then replacing them

    oldConfirmBtn = booleanDialog.querySelector('#confirm')
    newConfirmBtn = oldConfirmBtn.cloneNode(true)
    oldConfirmBtn.parentNode.replaceChild(newConfirmBtn, oldConfirmBtn)

    oldCancelBtn = booleanDialog.querySelector('#cancel')
    newCancelBtn = oldCancelBtn.cloneNode(true)
    oldCancelBtn.parentNode.replaceChild(newCancelBtn, oldCancelBtn)
})

infoInputs.forEach(input => {
    input.addEventListener('input', () => {
        updatedInfo[input.name] = input.value

        if (updatedInfo[input.name] === originalInfo[input.name]) {
            delete updatedInfo[input.name]
        }
    })
})

function enterEditMode() {
    // cache the original input values and enable the inputs
    infoInputs.forEach(input => {
        originalInfo[input.name] = input.value
        input.disabled = false
    })

    editBtn.textContent = 'Update'
    deleteBtn.textContent = 'Cancel'
}

function exitEditMode() {
    // remove info on previous input values and disable the inputs
    infoInputs.forEach(input => {
        delete originalInfo[input.name]
        input.disabled = true
    })

    // remove any field error
    removeFieldError(firstNameField)
    removeFieldError(lastNameField)

    resetUpdatedInfo()
    editBtn.textContent = 'Edit'
    deleteBtn.textContent = 'Delete'
}

function resetUpdatedInfo() {
    Object.keys(updatedInfo).forEach(key => delete updatedInfo[key])
}

function validateForm() {

    let isValid = true

    if (!requirementValidation(firstNameField)) {
        addFieldError(firstNameField, 'This field is required.')
        isValid = false
    }

    if (!requirementValidation(lastNameField)) {
        addFieldError(lastNameField, 'This field is required.')
        isValid = false
    }

    return isValid
}

function removeFieldError(field) {
    field.classList.remove('error-field')
    errorSpan = document.querySelector(`#${field.id} + .error-span`)
    errorSpan.style.textContent = ''
}

function addFieldError(field, errorMessage) {
    field.classList.add('error-field')
    errorSpan = document.querySelector(`#${field.id} + .error-span`)
    errorSpan.textContent = errorMessage
}

function requirementValidation(field) {
    return field.value !== ''
}

async function deleteProfile() {
    loaderDialog.querySelector('p').textContent = 'Deleting profile...'
    loaderDialog.showModal()

    fetch('http://localhost:3000/api/profile', {
        method: 'DELETE'
    }).then(res => {
        if (res.ok) {
            profileContainer.style.opacity = 0
            loaderDialog.querySelector('p').textContent = 'Profile deleted successfully.'

            setTimeout(() => {
                window.location.replace('/login.html')
            }, 2000)
        }
    })
}

async function serverSideUpdate() {
    await fetch('http://localhost:3000/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedInfo),
    }).then(res => res.ok)

}