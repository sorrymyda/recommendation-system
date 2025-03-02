let currentUser = null;

// 显示注册表单
function showRegisterForm() {
    document.getElementById("loginForm").classList.add("d-none");
    document.getElementById("registerForm").classList.remove("d-none");
}

// 显示登录表单
function showLoginForm() {
    document.getElementById("registerForm").classList.add("d-none");
    document.getElementById("loginForm").classList.remove("d-none");
}

// 登录
document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // 模拟登录（实际应调用后端 API）
    if (username && password) {
        currentUser = username;
        document.getElementById("authForm").classList.add("d-none");
        document.getElementById("recommendationForm").classList.remove("d-none");
    } else {
        alert("用户名或密码不能为空！");
    }
});

// 注册
document.getElementById("registerForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const newUsername = document.getElementById("newUsername").value;
    const newPassword = document.getElementById("newPassword").value;

    // 模拟注册（实际应调用后端 API）
    if (newUsername && newPassword) {
        alert("注册成功！请登录。");
        showLoginForm();
    } else {
        alert("用户名或密码不能为空！");
    }
});

// 获取餐厅推荐
document.getElementById("preferenceForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const region = document.getElementById("region").value;
    const preference = document.getElementById("preference").value;

    axios.post("https://recommendation-system.onrender.com/recommend", {
        region: region,
        preference: preference
    })
    .then(response => {
        const resultsDiv = document.getElementById("results");
        resultsDiv.innerHTML = "";
        response.data.forEach(restaurant => {
            const restaurantItem = document.createElement("div");
            restaurantItem.className = "list-group-item";
            restaurantItem.innerHTML = `
                <h5>${restaurant.name}</h5>
                <p>${restaurant.description}</p>
                <p><strong>评分：</strong>${restaurant.rating} | <strong>价格：</strong>${restaurant.price} 元</p>
                <p><strong>相似度：</strong>${restaurant.similarity.toFixed(2)}</p>
            `;
            resultsDiv.appendChild(restaurantItem);
        });
        document.getElementById("recommendations").classList.remove("d-none");
    })
    .catch(error => {
        console.error("请求失败：", error);
        alert("获取推荐失败，请稍后重试。");
    });
});

// 获取附近景点
function getNearbyAttractions() {
    const region = document.getElementById("region").value;

    axios.post("https://recommendation-system.onrender.com/nearby-attractions", {
        region: region
    })
    .then(response => {
        const resultsDiv = document.getElementById("results");
        resultsDiv.innerHTML = "";
        response.data.forEach(attraction => {
            const attractionItem = document.createElement("div");
            attractionItem.className = "list-group-item";
            attractionItem.innerHTML = `
                <h5>${attraction.name}</h5>
                <p><strong>城市：</strong>${attraction.city}</p>
            `;
            resultsDiv.appendChild(attractionItem);
        });
        document.getElementById("recommendations").classList.remove("d-none");
    })
    .catch(error => {
        console.error("请求失败：", error);
        alert("获取景点失败，请稍后重试。");
    });
}