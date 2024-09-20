function registerUser() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const repeatPassword = document.getElementById("repeat_password").value;
    let users = localStorage.getItem("users");
    userLists = users ? JSON.parse(users) : [];
    if (!email || !password || !repeatPassword) {
        alert("Please fill all the blank!");
        return;
    }
    const emailExists = userLists.some(data => data.email === email);
    if (emailExists === email) {
        alert("Email Already Taken!");
        return;
    } 
    else {
        if (password !== repeatPassword) {
            alert("Passwords do not match!");
            return; 
        } 
        const userId = generateUserId();
        userLists.push({
            userId: userId,
            email: email,
            password: password
        });
        localStorage.setItem("users", JSON.stringify(userLists));
        alert("Register Successful!");
        window.location.href = "login.html";
    }
    
}

function loginUser() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const rememberMe = document.getElementById("remember-me").checked;
    let userLists = JSON.parse(localStorage.getItem("users")) || [];
    const currentUser = userLists.find(data => data.email === email && data.password === password);
    if (currentUser) {
        alert("Login Successful");
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        if (rememberMe) {
            localStorage.setItem("rememberedUser", JSON.stringify({ email: currentUser.email }));
        } else {
            localStorage.removeItem("rememberedUser");
        }
        window.location.href = "index.html";
    } else {
        alert("Email or Password Invalid!");
    }
}
function generateUserId() {
    return 'user-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}
function logout() {
    localStorage.removeItem("currentUser"); 
    localStorage.removeItem("rememberedUser"); 
    window.location.href = "login.html"; 
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('login-container').style.display = 'block';
    const rememberedUser = JSON.parse(localStorage.getItem("rememberedUser"));
    if (rememberedUser) {
        const userLists = JSON.parse(localStorage.getItem("users")) || [];
        const currentUser = userLists.find(user => user.email === rememberedUser.email);
        if (currentUser) {
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
            window.location.href = "index.html";
        }
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const INVALID_USER_INDEX = -1;
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    let userTodos = JSON.parse(localStorage.getItem("userTodoLists")) || [];
    let todos = userTodos.find(user => user.userId === currentUser.userId)?.todos || [];
    
    const taskNameInput = document.getElementById("task-name");
    const createButton = document.getElementById("create-task");
    const cancelButton = document.getElementById("cancel-all-change");
    const todoList = document.getElementById("todo-list");
    const filter = document.getElementById("filter");

    const todoFilterValues = Object.freeze({
        ALL: "all",
        DONE: "done",
        UNDONE: "undone"
    });

    createButton.addEventListener("click", addTask);
    cancelButton.addEventListener("click", cancelAllChange);
    filter.addEventListener("change", renderTodoList);

    function addTask() {
        const taskName = taskNameInput.value.trim();
        if (taskName === "") {
            alert("Please input a task");
            return;
        }
        todos.unshift({
            name: taskName,
            done: false
        });
        taskNameInput.value = "";
        saveTodos();
        renderTodoList();
    }

    function cancelAllChange() {
        taskNameInput.value = "";
    }

    function editTask(index) {
        const editItem = document.querySelector(`.taskName-${index}`);
        const editingValue = editItem.innerHTML;
        const inputElement = document.createElement("input");
        inputElement.value = editingValue;
        editItem.replaceWith(inputElement);
        inputElement.focus();
        inputElement.addEventListener("blur", () => {
            const updateValue = inputElement.value.trim();
            if (updateValue) {
                todos[index].name = updateValue;
                saveTodos();
                renderTodoList();
            }
        });
    }

    function deleteTask(index) {
        todos.splice(index, 1);
        saveTodos();
        renderTodoList();
    }

    function toggleTask(index) {
        const selectedTodo = todos[index];
        todos.splice(index, 1);
        selectedTodo.done = !selectedTodo.done;
        todos.push(selectedTodo);
        saveTodos();
        renderTodoList();
    }

    function getFilteredTodos() {
        const filterValueOfTask = filter.value;
        if (filterValueOfTask === todoFilterValues.ALL) {
            return todos;
        }
        if (filterValueOfTask === todoFilterValues.DONE) {
            return todos.filter(todo => todo.done);
        } else {
            return todos.filter(todo => !todo.done);
        }
    }

    function renderTodoList() {
        const filterValueOfTask = filter.value;
        todoList.innerHTML = "";
        getFilteredTodos().forEach((todo, index) => {
            const li = document.createElement("li");
            li.className = todo.done ? "done" : "";
            li.innerHTML = `
                <input type="checkbox" class="check-box" onclick="toggleTask(${index})" ${todo.done ? "checked" : ""}>
                <span class="taskName-${index}">${todo.name}</span>
                <div>
                    <button class="edit" onclick="editTask(${index})">Edit</button>
                    <button class="delete" onclick="deleteTask(${index})">Delete</button>
                </div>
            `;
            todoList.appendChild(li);
        });
    }

    function saveTodos() {
        const userIndex = userTodos.findIndex(user => user.userId === currentUser.userId);
        if (userIndex !== INVALID_USER_INDEX) {
            userTodos[userIndex].todos = todos; 
        } else {
            userTodos.push({ userId: currentUser.userId, todos: todos });
        }
        localStorage.setItem("userTodoLists", JSON.stringify(userTodos));
    }
    window.editTask = editTask;
    window.deleteTask = deleteTask;
    window.toggleTask = toggleTask;
    
    renderTodoList();
});