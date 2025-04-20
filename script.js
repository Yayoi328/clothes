// 存储衣物数据的数组
let clothesData = [];

// DOM元素
const uploadArea = document.getElementById('upload-area');
const fileUpload = document.getElementById('file-upload');
const uploadForm = document.getElementById('upload-form');
const itemNameInput = document.getElementById('item-name');
const customTagsInput = document.getElementById('custom-tags');
const clothesContainer = document.getElementById('clothes-container');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const selectedTagsContainer = document.getElementById('selected-tags');

// 选中的筛选标签
let selectedFilterTags = [];

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    // 从本地存储加载数据
    loadFromLocalStorage();
    
    // 初始化上传区域
    initUploadArea();
    
    // 初始化标签选择
    initTagSelection();
    
    // 初始化筛选区
    initFilterSection();
    
    // 初始化搜索功能
    initSearch();
    
    // 渲染衣物卡片
    renderClothes();
});

// 从本地存储加载数据
function loadFromLocalStorage() {
    const savedData = localStorage.getItem('clothesData');
    if (savedData) {
        clothesData = JSON.parse(savedData);
    }
}

// 保存数据到本地存储
function saveToLocalStorage() {
    localStorage.setItem('clothesData', JSON.stringify(clothesData));
}

// 初始化上传区域
function initUploadArea() {
    // 点击上传区域时触发文件选择
    uploadArea.addEventListener('click', () => {
        fileUpload.click();
    });
    
    // 文件拖拽效果
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('active');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('active');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('active');
        
        if (e.dataTransfer.files.length) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });
    
    // 监听文件选择
    fileUpload.addEventListener('change', () => {
        if (fileUpload.files.length) {
            handleFileUpload(fileUpload.files[0]);
        }
    });
    
    // 处理表单提交
    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitForm();
    });
}

// 处理文件上传
function handleFileUpload(file) {
    if (!file.type.startsWith('image/')) {
        alert('请上传图片文件');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
        uploadArea.innerHTML = `
            <img src="${e.target.result}" alt="预览图">
            <div class="remove-image">
                <i class="fas fa-times"></i>
            </div>
        `;
        uploadArea.classList.add('has-preview');
        
        // 添加移除图片的功能
        document.querySelector('.remove-image').addEventListener('click', (event) => {
            event.stopPropagation();
            resetUploadArea();
        });
    };
    
    reader.readAsDataURL(file);
}

// 重置上传区域
function resetUploadArea() {
    uploadArea.innerHTML = `
        <i class="fas fa-plus"></i>
        <p>点击或拖拽图片到此处</p>
        <input type="file" id="file-upload" accept="image/*" hidden>
    `;
    uploadArea.classList.remove('has-preview');
    
    // 重新获取文件上传输入框并添加事件监听
    const newFileUpload = document.getElementById('file-upload');
    newFileUpload.addEventListener('change', () => {
        if (newFileUpload.files.length) {
            handleFileUpload(newFileUpload.files[0]);
        }
    });
}

// 初始化标签选择
function initTagSelection() {
    const optionTags = document.querySelectorAll('.option-tag');
    
    optionTags.forEach(tag => {
        tag.addEventListener('click', () => {
            tag.classList.toggle('selected');
        });
    });
}

// 提交表单
function submitForm() {
    // 验证名称
    if (!itemNameInput.value.trim()) {
        alert('请输入衣物名称');
        return;
    }
    
    // 获取图片预览
    const imagePreview = uploadArea.querySelector('img');
    if (!imagePreview) {
        alert('请上传衣物图片');
        return;
    }
    
    // 收集选中的标签
    const selectedTags = {
        season: [],
        scene: [],
        style: [],
        material: [],
        custom: []
    };
    
    document.querySelectorAll('.option-tag.selected').forEach(tag => {
        const tagType = tag.classList[1]; // season, scene, style, material
        const tagValue = tag.getAttribute('data-tag');
        selectedTags[tagType].push(tagValue);
    });
    
    // 处理自定义标签
    if (customTagsInput.value.trim()) {
        selectedTags.custom = customTagsInput.value.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag !== '');
    }
    
    // 创建新衣物对象
    const newClothes = {
        id: Date.now(), // 使用时间戳作为唯一ID
        name: itemNameInput.value.trim(),
        image: imagePreview.src,
        tags: selectedTags,
        timestamp: new Date().toISOString()
    };
    
    // 添加到数据数组
    clothesData.unshift(newClothes);
    
    // 保存到本地存储
    saveToLocalStorage();
    
    // 重新渲染衣物列表
    renderClothes();
    
    // 重置表单
    resetForm();
    
    // 显示成功提示
    alert('添加成功！');
}

// 重置表单
function resetForm() {
    itemNameInput.value = '';
    customTagsInput.value = '';
    
    // 取消选中的标签
    document.querySelectorAll('.option-tag.selected').forEach(tag => {
        tag.classList.remove('selected');
    });
    
    // 重置上传区域
    resetUploadArea();
}

// 初始化筛选区
function initFilterSection() {
    // 切换分类展开/折叠
    const categoryHeaders = document.querySelectorAll('.category-header');
    
    categoryHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const category = header.getAttribute('data-category');
            const tagsContainer = document.getElementById(`${category}-tags`);
            
            // 切换显示/隐藏状态
            if (tagsContainer.style.display === 'none') {
                tagsContainer.style.display = 'flex';
                header.querySelector('i').classList.remove('fa-chevron-right');
                header.querySelector('i').classList.add('fa-chevron-down');
            } else {
                tagsContainer.style.display = 'none';
                header.querySelector('i').classList.remove('fa-chevron-down');
                header.querySelector('i').classList.add('fa-chevron-right');
            }
        });
    });
    
    // 添加标签筛选功能
    const filterTags = document.querySelectorAll('.category-tags .tag');
    
    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            const tagValue = tag.getAttribute('data-tag');
            const categoryId = tag.parentElement.id;
            const category = categoryId.split('-')[0]; // 提取类别：season, scene, style, material
            
            // 检查标签是否已选中
            const tagIndex = selectedFilterTags.findIndex(t => t.value === tagValue && t.category === category);
            
            if (tagIndex === -1) {
                // 添加到已选标签
                selectedFilterTags.push({
                    value: tagValue,
                    category: category
                });
                tag.classList.add('active');
            } else {
                // 从已选标签中移除
                selectedFilterTags.splice(tagIndex, 1);
                tag.classList.remove('active');
            }
            
            // 更新已选标签显示
            updateSelectedTags();
            
            // 重新过滤并渲染衣物
            renderClothes();
        });
    });
}

// 更新已选标签显示
function updateSelectedTags() {
    selectedTagsContainer.innerHTML = '';
    
    if (selectedFilterTags.length === 0) {
        return;
    }
    
    // 添加标题
    const titleSpan = document.createElement('span');
    titleSpan.textContent = '已选：';
    titleSpan.className = 'selected-tags-title';
    selectedTagsContainer.appendChild(titleSpan);
    
    // 添加各个标签
    selectedFilterTags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'selected-tag';
        tagElement.innerHTML = `
            ${tag.value}
            <i class="fas fa-times remove" data-value="${tag.value}" data-category="${tag.category}"></i>
        `;
        selectedTagsContainer.appendChild(tagElement);
    });
    
    // 添加移除标签的事件
    document.querySelectorAll('.selected-tag .remove').forEach(removeBtn => {
        removeBtn.addEventListener('click', () => {
            const tagValue = removeBtn.getAttribute('data-value');
            const category = removeBtn.getAttribute('data-category');
            
            // 从已选标签中移除
            const tagIndex = selectedFilterTags.findIndex(t => t.value === tagValue && t.category === category);
            if (tagIndex !== -1) {
                selectedFilterTags.splice(tagIndex, 1);
            }
            
            // 更新左侧筛选栏中的高亮状态
            const filterTag = document.querySelector(`#${category}-tags .tag[data-tag="${tagValue}"]`);
            if (filterTag) {
                filterTag.classList.remove('active');
            }
            
            // 更新已选标签显示
            updateSelectedTags();
            
            // 重新过滤并渲染衣物
            renderClothes();
        });
    });
}

// 初始化搜索功能
function initSearch() {
    // 点击搜索按钮
    searchButton.addEventListener('click', () => {
        renderClothes();
    });
    
    // 回车搜索
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            renderClothes();
        }
    });
}

// 渲染衣物卡片
function renderClothes() {
    // 获取搜索关键词
    const searchKeyword = searchInput.value.trim().toLowerCase();
    
    // 过滤数据
    let filteredClothes = clothesData;
    
    // 按搜索关键词过滤
    if (searchKeyword) {
        filteredClothes = filteredClothes.filter(item => {
            return item.name.toLowerCase().includes(searchKeyword);
        });
    }
    
    // 按选中的标签过滤
    if (selectedFilterTags.length > 0) {
        filteredClothes = filteredClothes.filter(item => {
            // 所有选中的标签都需要匹配
            return selectedFilterTags.every(tag => {
                const categoryTags = item.tags[tag.category];
                return categoryTags && categoryTags.includes(tag.value);
            });
        });
    }
    
    // 清空容器
    clothesContainer.innerHTML = '';
    
    // 如果没有数据
    if (filteredClothes.length === 0) {
        clothesContainer.innerHTML = '<div class="no-results">没有找到匹配的衣物</div>';
        return;
    }
    
    // 渲染所有卡片
    filteredClothes.forEach(item => {
        const card = createClothesCard(item);
        clothesContainer.appendChild(card);
    });
}

// 创建衣物卡片元素
function createClothesCard(item) {
    const card = document.createElement('div');
    card.className = 'clothes-card';
    
    // 格式化日期显示
    const date = new Date(item.timestamp);
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    
    // 收集所有标签为一个数组
    const allTags = [
        ...item.tags.season.map(tag => ({ type: 'season', value: tag })),
        ...item.tags.scene.map(tag => ({ type: 'scene', value: tag })),
        ...item.tags.style.map(tag => ({ type: 'style', value: tag })),
        ...item.tags.material.map(tag => ({ type: 'material', value: tag })),
        ...item.tags.custom.map(tag => ({ type: 'custom', value: tag }))
    ];
    
    // 生成标签HTML
    const tagsHTML = allTags.map(tag => `
        <span class="card-tag ${tag.type}">${tag.value}</span>
    `).join('');
    
    card.innerHTML = `
        <div class="card-image">
            <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="card-content">
            <div class="card-title">${item.name}</div>
            <div class="card-tags">
                ${tagsHTML}
            </div>
            <div class="card-time">${formattedDate}</div>
        </div>
    `;
    
    return card;
}

// 示例数据（可选）- 如果需要预先填充一些数据，可以取消注释
/*
setTimeout(() => {
    if (clothesData.length === 0) {
        clothesData = [
            {
                id: 1,
                name: "牛仔外套",
                image: "https://via.placeholder.com/400x500?text=牛仔外套",
                tags: {
                    season: ["春季", "秋季"],
                    scene: ["休闲"],
                    style: ["复古"],
                    material: ["牛仔"],
                    custom: []
                },
                timestamp: "2023-03-15T08:30:00.000Z"
            },
            {
                id: 2,
                name: "黑色西装",
                image: "https://via.placeholder.com/400x500?text=黑色西装",
                tags: {
                    season: ["春季", "秋季", "冬季"],
                    scene: ["商务", "职场"],
                    style: ["简约"],
                    material: ["羊毛"],
                    custom: ["正式"]
                },
                timestamp: "2023-02-10T14:20:00.000Z"
            }
        ];
        saveToLocalStorage();
        renderClothes();
    }
}, 1000);
*/ 