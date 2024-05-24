const editBtn = document.querySelector('#edit')
const deleteBtn = document.querySelector('#delete')
const uploadImgBth = document.querySelector('#upload-img')

// form elements
const infoForm = document.querySelector('.info-container')
const infoInputs = infoForm.querySelectorAll('input, select');
const firstNameField = infoInputs[0]
const lastNameField = infoInputs[1]
firstNameField.addEventListener('input', () => removeFieldError(firstNameField))
lastNameField.addEventListener('input', () => removeFieldError(lastNameField))

// modal dialog
const dialogBox = document.querySelector('dialog')

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
                //await serverSideUpdate()
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

        const deleteProfile = () => {
            console.log('Delete')
        }

        dialogBooleanEvent(deleteProfile, null, 'Do you confirm the deletion of your profile?')
    }

})

// runs functions based on the choice made in yes/no dialogs
function dialogBooleanEvent(onconfirm, oncancel, dialogText = 'Do you confirm', confirmText = 'Yes', cancelText = 'No') {
    dialogBox.querySelector('p').textContent = dialogText

    confirmBtn = dialogBox.querySelector('#confirm')
    confirmBtn.textContent = confirmText
    confirmBtn.addEventListener('click', () => {
        onconfirm()
        dialogBox.close()
    })

    cancelBtn = dialogBox.querySelector('#cancel')
    cancelBtn.textContent = cancelText
    cancelBtn.addEventListener('click', () => {
        if (oncancel) oncancel()
        dialogBox.close()
    })

    dialogBox.showModal()
}

dialogBox.addEventListener('close', () => {
    // remove event listeners on the dialog buttons by cloning and then replacing them

    oldConfirmBtn = dialogBox.querySelector('#confirm')
    newConfirmBtn = oldConfirmBtn.cloneNode(true)
    oldConfirmBtn.parentNode.replaceChild(newConfirmBtn, oldConfirmBtn)

    oldCancelBtn = dialogBox.querySelector('#cancel')
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
    errorSpan.style.textContent= ''
}

function addFieldError(field, errorMessage) {
    field.classList.add('error-field')
    errorSpan = document.querySelector(`#${field.id} + .error-span`)
    errorSpan.textContent = errorMessage
}

function requirementValidation(field) {
    return field.value !== ''
}

// async function deleteProfile() {
//     new Promise((resolve, reject) => {
//         fetch('http://localhost:3000/profile', {
//             method: 'DELETE'
//         })
//     })
// }

// async function serverSideUpdate() {
//     new Promise((resolve, reject) => {
//         fetch('http://localhost:3000/profile', {
//             method: 'PUT',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(updateInfo),
//         }).then(res => {
//             if (res.ok) {
//                 resolve()
//             }

//             reject()
//         })
//     })
// }