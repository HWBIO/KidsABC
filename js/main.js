document.addEventListener('DOMContentLoaded', function() {
    // 初始化各页面
    initArticleList();
    initArticleDetailPage();
    initProfilePage(); // 添加此行
    
    // 初始化收藏功能
    initFavoritesFeature();
});

// Initialize article list page
function initArticleList() {
    // 获取所有日期项
    const dateItems = document.querySelectorAll('.date-item');
    const dateContainer = document.querySelector('.date-filter-scroll');
    
    // 初始化日期点击事件
    dateItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除之前的激活状态
            document.querySelectorAll('.date-item').forEach(el => {
                el.classList.remove('active-date');
            });
            
            // 添加激活状态到当前点击项
            this.classList.add('active-date');
            
            // 获取日期数据
            const dateStr = this.getAttribute('data-date');
            const dateParts = dateStr.split('-');
            const month = parseInt(dateParts[1]);
            const day = parseInt(dateParts[2]);
            const formattedDate = month + '月' + day + '日';
            
            // 根据日期筛选文章
            filterArticlesByDate(formattedDate);
        });
    });
    
    // 初始化水平滚动功能
    if (dateContainer) {
        setupDateScrolling(dateContainer);
        
        // 页面加载时，滚动到活动日期
        scrollToActiveDate(dateContainer);
    }
    
    // 初始化文章点击事件，跳转到详情页
    const articleCards = document.querySelectorAll('.article-card');
    articleCards.forEach(card => {
        card.addEventListener('click', function() {
            const articleId = this.getAttribute('data-article-id');
            window.location.href = `article-detail.html?id=${articleId}`;
        });
    });
    
    // 页面加载完成后，默认过滤显示最新日期（当前active-date）的文章
    filterByActiveDate();
}

// 根据当前激活的日期过滤文章
function filterByActiveDate() {
    const activeDate = document.querySelector('.date-item.active-date');
    if (activeDate) {
        const dateStr = activeDate.getAttribute('data-date');
        const dateParts = dateStr.split('-');
        const month = parseInt(dateParts[1]);
        const day = parseInt(dateParts[2]);
        const formattedDate = month + '月' + day + '日';
        
        // 触发过滤
        filterArticlesByDate(formattedDate);
    }
}

// 设置日期滚动交互
function setupDateScrolling(container) {
    let isDown = false;
    let startX;
    let scrollLeft;

    container.addEventListener('mousedown', (e) => {
        isDown = true;
        container.classList.add('active');
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    });

    container.addEventListener('mouseleave', () => {
        isDown = false;
        container.classList.remove('active');
    });

    container.addEventListener('mouseup', () => {
        isDown = false;
        container.classList.remove('active');
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2; // 滚动速度
        container.scrollLeft = scrollLeft - walk;
    });

    // 添加触摸事件支持
    container.addEventListener('touchstart', (e) => {
        isDown = true;
        container.classList.add('active');
        startX = e.touches[0].pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    }, { passive: true });

    container.addEventListener('touchend', () => {
        isDown = false;
        container.classList.remove('active');
    });

    container.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        const x = e.touches[0].pageX - container.offsetLeft;
        const walk = (x - startX) * 2;
        container.scrollLeft = scrollLeft - walk;
    }, { passive: true });
}

// 滚动到当前激活的日期
function scrollToActiveDate(container) {
    const activeDate = document.querySelector('.date-item.active-date');
    if (activeDate) {
        // 滚动到活动日期（在滚动区域中居中显示）
        setTimeout(function() {
            container.scrollLeft = activeDate.offsetLeft - (container.clientWidth / 2) + (activeDate.clientWidth / 2);
        }, 100);
    }
}

// Function to filter articles by date
function filterArticlesByDate(dateStr) {
    // 获取所有文章卡片
    const articles = document.querySelectorAll('.article-card');
    let visibleCount = 0;
    
    // 提取传入日期的月和日信息
    const dateMatch = dateStr.match(/(\d+)月(\d+)日/);
    if (!dateMatch) {
        console.error(`日期格式错误: ${dateStr}`);
        return;
    }
    
    const targetMonth = parseInt(dateMatch[1], 10);
    const targetDay = parseInt(dateMatch[2], 10);
    
    // 显示所有匹配日期的文章
    articles.forEach(article => {
        const articleDateElement = article.querySelector('.article-date');
        if (!articleDateElement) return;
        
        const articleDateText = articleDateElement.textContent.trim();
        const articleMatch = articleDateText.match(/(\d+)月(\d+)日/);
        
        if (articleMatch) {
            const articleMonth = parseInt(articleMatch[1], 10);
            const articleDay = parseInt(articleMatch[2], 10);
            
            // 同时检查月份和日期是否匹配
            if (articleMonth === targetMonth && articleDay === targetDay) {
                article.style.display = 'block';
                visibleCount++;
            } else {
                article.style.display = 'none';
            }
        } else {
            // 如果文章日期格式不正确，默认隐藏
            article.style.display = 'none';
        }
    });
    
    // 如果没有文章对应这个日期，显示"当日无文章"提示
    const noArticlesMsg = document.querySelector('.no-articles-message') || 
                         document.createElement('div');
    
    if (visibleCount === 0) {
        noArticlesMsg.className = 'no-articles-message';
        noArticlesMsg.innerHTML = `<p>当日没有文章，请选择其他日期</p>`;
        
        const articleList = document.querySelector('.article-list');
        if (articleList && !document.querySelector('.no-articles-message')) {
            articleList.appendChild(noArticlesMsg);
        }
        noArticlesMsg.style.display = 'block';
    } else {
        noArticlesMsg.style.display = 'none';
    }
}

// Simulate loading animation
function simulateLoading() {
    // Simulate loading delay
    document.body.classList.add('loading');
    setTimeout(function() {
        document.body.classList.remove('loading');
    }, 500);
}

// Initialize article detail page
function initArticleDetailPage() {
    const articleDetailPage = document.getElementById('article-detail-container');
    if (!articleDetailPage) return;
    
    // 初始化文章详情页的标签页切换
    initArticleDetailTabs();
    
    // 检查URL中是否有section参数，如果有则自动切换到相应的标签页
    const urlParams = new URLSearchParams(window.location.search);
    const sectionParam = urlParams.get('section');
    if (sectionParam) {
        // 获取对应的导航菜单项
        const targetNavItem = document.querySelector(`.sub-nav-item[data-target="${sectionParam}"]`);
        if (targetNavItem) {
            // 模拟点击该导航菜单项
            targetNavItem.click();
        }
    }
    
    // 初始化全局导航栏功能
    initGlobalBarControls();
    
    // Initialize text to speech (保留原来的代码，但现在主要使用全局导航栏控制)
    const speechBtn = document.getElementById('speech-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const speedToggle = document.querySelector('.speed-toggle');
    const languageToggle = document.querySelector('.language-toggle');
    
    if (speechBtn) {
        // Initialize Web Speech API
        const synth = window.speechSynthesis;
        let utterance;
        
        // Speech button
        speechBtn.addEventListener('click', function() {
            if (!synth.speaking) {
                // Get article content
                const articleContent = document.querySelector('.article-content').textContent;
                utterance = new SpeechSynthesisUtterance(articleContent);
                
                // Set language based on toggle
                if (languageToggle && languageToggle.classList.contains('cn')) {
                    utterance.lang = 'zh-CN';
                } else {
                    utterance.lang = 'en-US';
                }
                
                // Set speed based on toggle
                if (speedToggle) {
                    const speed = speedToggle.textContent.trim();
                    if (speed === '1.5x') {
                        utterance.rate = 1.5;
                    } else if (speed === '2.0x') {
                        utterance.rate = 2.0;
                    } else {
                        utterance.rate = 1.0;
                    }
                }
                
                synth.speak(utterance);
                
                // Update UI
                speechBtn.classList.add('hidden');
                pauseBtn.classList.remove('hidden');
                stopBtn.classList.remove('hidden');
            }
        });
        
        // Pause button
        if (pauseBtn) {
            pauseBtn.addEventListener('click', function() {
                if (synth.speaking) {
                    if (synth.paused) {
                        synth.resume();
                        pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    } else {
                        synth.pause();
                        pauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                    }
                }
            });
        }
        
        // Stop button
        if (stopBtn) {
            stopBtn.addEventListener('click', function() {
                synth.cancel();
                
                // Update UI
                speechBtn.classList.remove('hidden');
                pauseBtn.classList.add('hidden');
                stopBtn.classList.add('hidden');
                pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            });
        }
        
        // Speed toggle
        if (speedToggle) {
            speedToggle.addEventListener('click', function() {
                const currentSpeed = this.textContent.trim();
                if (currentSpeed === '1.0x') {
                    this.textContent = '1.5x';
                } else if (currentSpeed === '1.5x') {
                    this.textContent = '2.0x';
                } else {
                    this.textContent = '1.0x';
                }
            });
        }
        
        // Language toggle
        if (languageToggle) {
            languageToggle.addEventListener('click', function() {
                this.classList.toggle('cn');
                if (this.classList.contains('cn')) {
                    this.textContent = '中';
                } else {
                    this.textContent = 'EN';
                }
            });
        }
    }
}

// 初始化文章详情页的标签页切换
function initArticleDetailTabs() {
    const subNavItems = document.querySelectorAll('.sub-nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    const readingControls = document.getElementById('readingControls');
    const quizControls = document.getElementById('quizControls');
    
    subNavItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有导航项的活动状态
            subNavItems.forEach(navItem => navItem.classList.remove('active'));
            
            // 为当前点击的导航项添加活动状态
            this.classList.add('active');
            
            // 获取目标内容区域
            const targetId = this.getAttribute('data-target');
            
            // 隐藏所有内容区域，显示目标区域
            contentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId + '-section') {
                    section.classList.add('active');
                }
            });
            
            // 切换全局导航栏
            if (targetId === 'read') {
                readingControls.style.display = 'flex';
                quizControls.style.display = 'none';
            } else if (targetId === 'quiz') {
                readingControls.style.display = 'none';
                quizControls.style.display = 'flex';
                
                // 重置所有选项的选中状态
                resetQuizSelections();
            }
        });
    });
    
    // 初始化问题导航
    initQuizNavigation();
    
    // 初始化文章操作按钮
    initArticleActions();
}

// 清空所有问题选项的选中状态
function resetQuizSelections() {
    console.log('重置所有问题的选中状态');
    const allOptions = document.querySelectorAll('.quiz-question .answer-option');
    
    // 移除所有选项的selected类
    allOptions.forEach(option => {
        option.classList.remove('selected');
    });
    
    // 清除localStorage中的用户答案
    localStorage.removeItem('userAnswers');
    console.log('已清除所有选中状态和保存的答案');
}

// 初始化问题导航
function initQuizNavigation() {
    console.log('开始初始化问题导航...');
    const quizQuestions = document.querySelectorAll('.quiz-question');
    const nextButton = document.querySelector('.global-bar .next-question-btn');
    const currentNumberElement = document.querySelector('.global-bar .current-number');
    const totalNumberElement = document.querySelector('.global-bar .total-number');
    
    // 初始化问题显示状态
    console.log('初始化问题显示状态:');
    quizQuestions.forEach((question, index) => {
        const questionNumber = question.getAttribute('data-question');
        console.log(`问题索引: ${index}, data-question: ${questionNumber}`);
        if (index === 0) {
            question.style.display = 'block'; // 显示第一题
        } else {
            question.style.display = 'none'; // 隐藏其他题
        }
    });
    
    // 初始化计数器设置
    if (totalNumberElement) {
        totalNumberElement.textContent = quizQuestions.length;
        console.log(`设置题目总数: ${quizQuestions.length}`);
    }
    
    if (currentNumberElement && quizQuestions.length > 0) {
        const firstQNum = quizQuestions[0].getAttribute('data-question') || '1';
        currentNumberElement.textContent = firstQNum;
        console.log(`初始计数器设置为: ${firstQNum}`);
    }
    
    // 初始化答题选项事件
    initAnswerOptionEvents();
    
    // 按钮文本更新
    updateQuizButtonText(quizQuestions, 0, nextButton);
    
    console.log('问题导航初始化完成');
    
    // 添加下一题按钮点击事件
    if (nextButton) {
        // 清除已有事件
        nextButton.removeEventListener('click', handleNextButtonClick);
        
        // 添加事件监听器
        nextButton.addEventListener('click', handleNextButtonClick);
        console.log('下一题按钮事件监听器添加成功');
    } else {
        console.error('找不到下一题按钮!');
    }
}

// 处理下一题按钮点击
function handleNextButtonClick() {
    console.log('下一题按钮被点击');
    const quizQuestions = document.querySelectorAll('.quiz-question');
    const nextButton = document.querySelector('.global-bar .next-question-btn');
    const currentNumberElement = document.querySelector('.global-bar .current-number');
    
    // 获取当前显示的问题
    let currentQuestion = null;
    quizQuestions.forEach(question => {
        if (question.style.display === 'block') {
            currentQuestion = question;
        }
    });
    
    if (!currentQuestion) {
        console.error('找不到当前显示的问题！');
        return;
    }
    
    // 保存用户答案
    saveUserAnswer(currentQuestion);
    
    // 获取当前问题索引和下一题索引
    const allQuestions = Array.from(quizQuestions);
    const currentIndex = allQuestions.indexOf(currentQuestion);
    console.log(`当前问题索引: ${currentIndex}, 总问题数: ${allQuestions.length}`);
    
    // 如果是最后一题，跳转到成绩页面
    if (currentIndex === allQuestions.length - 1) {
        // 计算成绩
        calculateAndSaveScore();
        // 跳转到成绩页面
        window.location.href = 'quiz-score.html';
        return;
    }
    
    // 计算下一题索引并获取下一题元素
    const nextIndex = currentIndex + 1;
    const nextQuestion = allQuestions[nextIndex];
    
    if (!nextQuestion) {
        console.error('找不到下一题！');
        return;
    }
    
    // 获取下一题编号
    const nextQuestionNum = nextQuestion.getAttribute('data-question');
    console.log(`下一题编号: ${nextQuestionNum}`);
    
    // 隐藏当前问题，显示下一题
    currentQuestion.style.display = 'none';
    nextQuestion.style.display = 'block';
    
    // 更新按钮文本
    updateQuizButtonText(quizQuestions, nextIndex, nextButton);
}

// 恢复已保存的答案选择
function restoreSavedAnswers() {
    console.log('尝试恢复已保存的答案');
    const userAnswers = JSON.parse(localStorage.getItem('userAnswers') || '{}');
    const quizQuestions = document.querySelectorAll('.quiz-question');
    
    quizQuestions.forEach(question => {
        const questionId = question.getAttribute('data-question');
        if (!questionId || !userAnswers[questionId] || !userAnswers[questionId].selected) {
            return; // 没有保存的答案
        }
        
        const savedAnswer = userAnswers[questionId].selected;
        console.log(`恢复问题${questionId}的答案: "${savedAnswer}"`);
        
        // 查找匹配的答案选项
        const options = question.querySelectorAll('.answer-option');
        options.forEach(option => {
            const optionText = option.querySelector('.option-text').textContent;
            if (optionText === savedAnswer) {
                // 移除所有已选状态
                options.forEach(opt => opt.classList.remove('selected'));
                // 标记为已选
                option.classList.add('selected');
                console.log(`找到并恢复问题${questionId}的答案选项`);
            }
        });
    });
}

// 更新下一题按钮文本
function updateQuizButtonText(quizQuestions, currentIndex, nextButton) {
    if (!nextButton) return;
    
    // 获取当前问题索引和总问题数
    const totalQuestions = quizQuestions.length;
    
    // 如果是最后一题，显示“判成绩”
    if (currentIndex === totalQuestions - 1) {
        nextButton.textContent = '判成绩';
    } else {
        nextButton.textContent = '下一题';
    }
}

// 答题选项点击事件
function initAnswerOptionEvents() {
    console.log('初始化答题选项点击事件');
    const answerOptions = document.querySelectorAll('.answer-option');
    
    answerOptions.forEach(option => {
        // 移除已有的事件监听器(避免重复绑定)
        option.removeEventListener('click', handleAnswerOptionClick);
        // 添加新的事件监听器
        option.addEventListener('click', handleAnswerOptionClick);
    });
}

// 处理答案选项点击
function handleAnswerOptionClick() {
    // 获取当前问题
    const currentQuestion = this.closest('.quiz-question');
    if (!currentQuestion) {
        console.error('无法找到当前问题元素');
        return;
    }
    
    // 获取问题编号
    const questionNumber = currentQuestion.getAttribute('data-question');
    console.log(`用户在问题${questionNumber}上选择了答案`);
    
    // 移除当前问题中所有选项的选中状态
    currentQuestion.querySelectorAll('.answer-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // 为当前点击的选项添加选中状态
    this.classList.add('selected');
    
    // 记录用户的选择
    const selectedText = this.querySelector('.option-text').textContent;
    const isCorrect = this.hasAttribute('data-correct');
    console.log(`用户选择了: "${selectedText}", 是否正确: ${isCorrect}`);
    
    // 立即保存答案
    saveSelectedAnswer(currentQuestion, this);
}

// 保存已选择的答案
function saveSelectedAnswer(questionElement, selectedOption) {
    if (!questionElement || !selectedOption) {
        console.error('保存答案失败 - 参数缺失');
        return;
    }
    
    const questionId = questionElement.getAttribute('data-question');
    if (!questionId) {
        console.error('问题元素缺少data-question属性!');
        return;
    }
    
    // 获取现有答题记录
    let userAnswers = JSON.parse(localStorage.getItem('userAnswers') || '{}');
    
    // 保存用户选择
    const isCorrect = selectedOption.hasAttribute('data-correct');
    const selectedText = selectedOption.querySelector('.option-text').textContent;
    
    userAnswers[questionId] = {
        selected: selectedText,
        correct: isCorrect
    };
    
    console.log(`实时保存答案 - 问题${questionId}: "${selectedText}", 正确: ${isCorrect}`);
    
    // 保存到localStorage
    localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
}

// 保存用户答题 (在点击下一题时调用)
function saveUserAnswer(questionElement) {
    if (!questionElement) {
        console.error('保存答案失败 - 问题元素缺失');
        return;
    }
    
    const questionId = questionElement.getAttribute('data-question');
    if (!questionId) {
        console.error('问题元素缺少data-question属性!');
        return;
    }
    
    const selectedOption = questionElement.querySelector('.answer-option.selected');
    
    // 获取现有答题记录
    let userAnswers = JSON.parse(localStorage.getItem('userAnswers') || '{}');
    
    // 保存用户选择
    if (selectedOption) {
        const isCorrect = selectedOption.hasAttribute('data-correct');
        const selectedText = selectedOption.querySelector('.option-text').textContent;
        
        userAnswers[questionId] = {
            selected: selectedText,
            correct: isCorrect
        };
        
        console.log(`最终保存答案 - 问题${questionId}: "${selectedText}", 正确: ${isCorrect}`);
    } else {
        console.log(`问题${questionId}没有选中的答案，检查是否已保存过`);
        
        // 检查是否已经有保存的答案
        if (!userAnswers[questionId]) {
            // 如果用户没有选择，则记录为未回答
            userAnswers[questionId] = {
                selected: null,
                correct: false
            };
            
            console.log(`保存答案 - 问题${questionId}: 未作答`);
        } else {
            console.log(`问题${questionId}已有答案:`, userAnswers[questionId]);
        }
    }
    
    // 保存到localStorage
    localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
}

// 计算和保存成绩
function calculateAndSaveScore() {
    const userAnswers = JSON.parse(localStorage.getItem('userAnswers') || '{}');
    const questions = document.querySelectorAll('.quiz-question');
    
    let correctCount = 0;
    const totalQuestions = questions.length;
    
    console.log('计算成绩 - 用户答案:', userAnswers);
    
    // 计算正确题数
    Object.keys(userAnswers).forEach(questionId => {
        if (userAnswers[questionId].correct) {
            correctCount++;
            console.log(`问题${questionId}: 回答正确`);
        } else {
            console.log(`问题${questionId}: 回答错误或未作答`);
        }
    });
    
    console.log(`成绩统计: ${correctCount}/${totalQuestions} 正确`);
    
    // 计算百分比
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    
    // 保存成绩结果
    const quizResults = {
        correctCount,
        totalQuestions,
        percentage
    };
    
    localStorage.setItem('quizResults', JSON.stringify(quizResults));
    console.log('成绩已保存:', quizResults);
}

// 初始化文章操作按钮（打卡、收藏和分享）
function initArticleActions() {
    const checkInButton = document.getElementById('checkInButton');
    const favoriteActionButton = document.getElementById('favoriteActionButton');
    const shareButton = document.getElementById('shareButton');
    
    // 从本地存储加载状态
    const articleId = getArticleIdFromUrl() || 'default-article';
    const checkedInArticles = JSON.parse(localStorage.getItem('checkedInArticles') || '[]');
    
    // 设置初始状态
    if (checkedInArticles.includes(articleId)) {
        checkInButton.classList.add('checked');
    }
    
    // 检查文章是否已收藏
    const favorites = getFavorites();
    const isAlreadyFavorited = favorites.some(item => item.id === articleId);
    
    if (favoriteActionButton) {
        if (isAlreadyFavorited) {
            favoriteActionButton.classList.add('active');
        }
        
        // 添加收藏按钮点击事件
        handleFavoriteActionButtonClick(favoriteActionButton, articleId);
    }
    
    // 打卡按钮点击事件
    if (checkInButton) {
        checkInButton.addEventListener('click', function() {
            this.classList.toggle('checked');
            
            // 更新本地存储
            const isChecked = this.classList.contains('checked');
            const checkedList = JSON.parse(localStorage.getItem('checkedInArticles') || '[]');
            
            if (isChecked && !checkedList.includes(articleId)) {
                checkedList.push(articleId);
                // 添加打卡动画
                showCheckInAnimation();
                
                // 延迟500毫秒后跳转到答题页，给动画显示的时间
                setTimeout(() => {
                    // 获取答题标签页元素
                    const quizTab = document.querySelector('.sub-nav-item[data-target="quiz"]');
                    if (quizTab) {
                        // 触发点击事件跳转到答题页
                        quizTab.click();
                    }
                }, 500);
            } else if (!isChecked && checkedList.includes(articleId)) {
                const index = checkedList.indexOf(articleId);
                if (index > -1) {
                    checkedList.splice(index, 1);
                }
            }
            
            localStorage.setItem('checkedInArticles', JSON.stringify(checkedList));
        });
    }
    
    // 分享按钮点击事件
    if (shareButton) {
        shareButton.addEventListener('click', function() {
            // 获取文章标题
            const articleTitle = document.querySelector('.article-overlay-title').textContent;
            
            // 如果支持Web Share API，使用原生分享功能
            if (navigator.share) {
                navigator.share({
                    title: articleTitle,
                    text: 'I am learning an interesting article on KidsABC!',
                    url: window.location.href
                })
                .then(() => console.log('Shared successfully'))
                .catch((error) => console.log('Sharing failed', error));
            } else {
                // 否则显示简单的分享对话框
                showSimpleShareDialog();
            }
        });
    }
}

// 文章操作区收藏按钮点击事件处理
function handleFavoriteActionButtonClick(favoriteActionButton, articleId) {
    favoriteActionButton.addEventListener('click', function() {
        this.classList.toggle('active');
        
        // 更新本地存储
        const isFavorited = this.classList.contains('active');
        
        // 获取当前文章信息用于收藏
        const articleTitle = document.querySelector('.article-overlay-title').textContent;
        const articleImage = document.querySelector('.article-banner img').src;
        
        // 调用toggleFavorite以同步两个按钮状态和存储
        // 创建临时invisibleButton以避免错误
        const tempButton = document.createElement('div');
        tempButton.id = 'favoriteButton';
        tempButton.innerHTML = '<i class="far fa-heart"></i>';
        tempButton.style.display = 'none';
        document.body.appendChild(tempButton);
        
        // 设置正确的按钮状态
        if (isFavorited) {
            tempButton.classList.add('favorited');
            tempButton.querySelector('i').classList.add('fas');
            tempButton.querySelector('i').classList.remove('far');
        } else {
            tempButton.classList.remove('favorited');
            tempButton.querySelector('i').classList.add('far');
            tempButton.querySelector('i').classList.remove('fas');
        }
        
        // 调用toggleFavorite处理收藏逻辑
        toggleFavorite(articleId, articleTitle, articleImage);
        
        // 移除临时按钮
        document.body.removeChild(tempButton);
    });
}

// 显示打卡成功动画
function showCheckInAnimation() {
    // 创建动画元素
    const animationEl = document.createElement('div');
    animationEl.className = 'check-in-animation';
    animationEl.innerHTML = '<i class="fas fa-check-circle"></i><span>Checked in successfully!</span>';
    
    // 添加到页面
    document.body.appendChild(animationEl);
    
    // 显示动画
    setTimeout(() => {
        animationEl.classList.add('show');
    }, 10);
    
    // 删除动画
    setTimeout(() => {
        animationEl.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(animationEl);
        }, 300);
    }, 2000);
}

// 显示简单的分享对话框
function showSimpleShareDialog() {
    // 创建对话框元素
    const dialogEl = document.createElement('div');
    dialogEl.className = 'share-dialog';
    dialogEl.innerHTML = `
        <div class="share-dialog-content">
            <h3>Share this article</h3>
            <div class="share-options">
                <div class="share-option" data-platform="wechat">
                    <i class="fab fa-weixin"></i>
                    <span>WeChat</span>
                </div>
                <div class="share-option" data-platform="weibo">
                    <i class="fab fa-weibo"></i>
                    <span>Weibo</span>
                </div>
                <div class="share-option" data-platform="qq">
                    <i class="fab fa-qq"></i>
                    <span>QQ</span>
                </div>
            </div>
            <button class="close-dialog-btn">Close</button>
        </div>
    `;
    
    // 添加到页面
    document.body.appendChild(dialogEl);
    
    // 显示对话框
    setTimeout(() => {
        dialogEl.classList.add('show');
    }, 10);
    
    // 关闭按钮事件
    const closeBtn = dialogEl.querySelector('.close-dialog-btn');
    closeBtn.addEventListener('click', function() {
        dialogEl.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(dialogEl);
        }, 300);
    });
    
    // 平台选项点击事件
    const shareOptions = dialogEl.querySelectorAll('.share-option');
    shareOptions.forEach(option => {
        option.addEventListener('click', function() {
            const platform = this.getAttribute('data-platform');
            console.log('Sharing to platform:', platform);
            
            // 这里只是模拟，实际上需要根据不同平台实现不同的分享逻辑
            alert('Sharing to ' + platform + ' is under development...');
            
            // 关闭对话框
            dialogEl.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(dialogEl);
            }, 300);
        });
    });
}

// 从URL获取文章ID
function getArticleIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// 初始化全局导航栏功能
function initGlobalBarControls() {
    // 获取控制元素
    const languageToggle = document.querySelector('.control-item.language-toggle');
    const playPauseBtn = document.querySelector('.control-item.play-pause');
    const backwardBtn = document.querySelector('.control-item.backward');
    const forwardBtn = document.querySelector('.control-item.forward');
    const speedControlBtn = document.querySelector('.control-item.speed-control');
    const progressBar = document.querySelector('.progress-bar');
    const progressFill = document.querySelector('.progress-fill');
    const progressHandle = document.querySelector('.progress-handle');
    const currentTimeEl = document.querySelector('.current-time');
    const totalTimeEl = document.querySelector('.total-time');
    
    // 获取文章内容元素
    const englishContent = document.querySelector('.english-content');
    const chineseContent = document.querySelector('.chinese-content');
    
    // 如果不在文章详情页，则退出
    if (!languageToggle || !englishContent || !chineseContent) {
        return;
    }
    
    // 全局变量
    const synth = window.speechSynthesis;
    let utterance = null;
    let currentSpeed = 1.0;
    let isPlaying = false;
    let isChineseMode = false;
    let currentText = '';  // 当前播放的文本
    let speakingPosition = 0;  // 记录播放位置
    
    // 文本高亮器
    let textHighlighter = null;
    
    // 初始化文本高亮器
    if (typeof TextHighlighter !== 'undefined') {
        textHighlighter = new TextHighlighter({
            highlightColor: '#FF8A65',
            container: document.querySelector('.english-content')
        });
    }
    
    // 播放进度相关变量
    let startTime = 0;
    let estimatedDuration = 0;
    let progressUpdateInterval = null;
    let isDragging = false;
    
    // 启动语音播放
    function startSpeaking() {
        // 获取当前显示的文章内容
        const activeContent = isChineseMode ? 
                            document.querySelector('.chinese-content') : 
                            document.querySelector('.english-content');
        
        if (!activeContent) {
            console.error('找不到文章内容元素');
            return;
        }
        
        // 获取文本内容
        currentText = activeContent.textContent.trim();
        
        if (currentText === '') {
            console.error('文章内容为空');
            return;
        }
        
        // 创建语音合成实例
        utterance = new SpeechSynthesisUtterance(currentText);
        
        // 设置语言
        utterance.lang = isChineseMode ? 'zh-CN' : 'en-US';
        
        // 设置语速
        utterance.rate = currentSpeed;
        
        // 估计总时长 (粗略估计，实际会根据语速和文本内容有所不同)
        estimatedDuration = currentText.length / (isChineseMode ? 10 : 15) / currentSpeed;
        if (totalTimeEl) {
            totalTimeEl.textContent = formatTime(estimatedDuration);
        }
        
        // 启用文本高亮
        if (textHighlighter) {
            // 更新高亮器的容器
            textHighlighter.updateContainer(activeContent);
            
            // 注册 boundary 事件用于高亮
            utterance.onboundary = function(event) {
                if (event.name === 'word') {
                    // 将事件传递给文本高亮器
                    textHighlighter.handleBoundary(event);
                }
            };
            
            // 文本播放结束时清除高亮
            utterance.onend = function() {
                isPlaying = false;
                
                // 清除高亮
                textHighlighter.reset();
                
                // 更新UI
                updatePlayPauseUI(false);
                
                // 停止进度更新
                stopProgressUpdate();
                
                // 将进度重置为100%（完成状态）
                updateProgress(100);
            };
        } else {
            // 设置播放结束事件处理（如果没有高亮器）
            utterance.onend = function() {
                isPlaying = false;
                
                // 更新UI
                updatePlayPauseUI(false);
                
                // 停止进度更新
                stopProgressUpdate();
                
                // 将进度重置为100%（完成状态）
                updateProgress(100);
            };
        }
        
        utterance.onerror = function(event) {
            console.error('语音合成错误:', event);
            isPlaying = false;
            updatePlayPauseUI(false);
            stopProgressUpdate();
            
            // 清除高亮
            if (textHighlighter) {
                textHighlighter.reset();
            }
        };
        
        // 确保之前没有播放
        synth.cancel();
        
        // 开始播放
        synth.speak(utterance);
        isPlaying = true;
        
        // 记录开始时间
        startTime = Date.now();
        
        // 开始更新进度
        startProgressUpdate();
        
        // 更新UI
        updatePlayPauseUI(true);
    }
    
    // 向后跳转15秒
    function seekBackward() {
        console.log('执行后退15秒');
        
        if (!isPlaying) return;
        
        // 计算当前已播放的时间（秒）
        const elapsedTime = (Date.now() - startTime) / 1000;
        console.log('当前已播放时间:', elapsedTime, '秒');
        
        // 计算新的开始位置（后退15秒，但不能小于0）
        const newPosition = Math.max(0, elapsedTime - 15);
        console.log('新的播放位置:', newPosition, '秒');
        
        // 暂停当前播放
        synth.pause();
        
        // 取消当前播放
        synth.cancel();
        
        // 从新位置开始播放
        startSpeakingFromPosition(newPosition);
        
        // 更新进度条
        updateProgress((newPosition / estimatedDuration) * 100);
        
        // 更新当前时间显示
        if (currentTimeEl) {
            currentTimeEl.textContent = formatTime(newPosition);
        }
    }
    
    // 向前跳转15秒
    function seekForward() {
        console.log('执行前进15秒');
        
        if (!isPlaying) return;
        
        // 计算当前已播放的时间（秒）
        const elapsedTime = (Date.now() - startTime) / 1000;
        console.log('当前已播放时间:', elapsedTime, '秒');
        
        // 计算新的开始位置（前进15秒，但不能超过估计的总时长）
        const newPosition = Math.min(estimatedDuration, elapsedTime + 15);
        console.log('新的播放位置:', newPosition, '秒');
        
        // 如果新位置已经接近或超过文章结尾，完成播放
        if (newPosition >= estimatedDuration - 1) {
            console.log('已到达文章结尾');
            
            // 暂停当前播放
            synth.pause();
            
            // 取消当前播放
            synth.cancel();
            
            // 更新UI
            isPlaying = false;
            updatePlayPauseUI(false);
            
            // 停止进度更新
            stopProgressUpdate();
            
            // 将进度重置为100%（完成状态）
            updateProgress(100);
            
            // 更新当前时间显示
            if (currentTimeEl) {
                currentTimeEl.textContent = formatTime(estimatedDuration);
            }
            
            return;
        }
        
        // 暂停当前播放
        synth.pause();
        
        // 取消当前播放
        synth.cancel();
        
        // 从新位置开始播放
        startSpeakingFromPosition(newPosition);
        
        // 更新进度条
        updateProgress((newPosition / estimatedDuration) * 100);
        
        // 更新当前时间显示
        if (currentTimeEl) {
            currentTimeEl.textContent = formatTime(newPosition);
        }
    }
    
    // 从指定位置开始播放
    function startSpeakingFromPosition(positionInSeconds) {
        console.log('从位置开始播放:', positionInSeconds, '秒');
        
        // 获取当前显示的文章内容
        const activeContent = isChineseMode ? 
                            document.querySelector('.chinese-content') : 
                            document.querySelector('.english-content');
        
        if (!activeContent) {
            console.error('找不到文章内容元素');
            return;
        }
        
        // 获取文本内容
        currentText = activeContent.textContent.trim();
        
        if (currentText === '') {
            console.error('文章内容为空');
            return;
        }
        
        // 计算一个估计的字符位置
        // 这是一个粗略估计，无法精确确定时间对应的文本位置
        const estimatedDuration = currentText.length / (isChineseMode ? 10 : 15) / currentSpeed;
        const positionRatio = positionInSeconds / estimatedDuration;
        const estimatedCharPosition = Math.floor(currentText.length * positionRatio);
        
        // 找到最近的完整句子开始位置（句号、问号、感叹号后的第一个非空白字符）
        let startPosition = 0;
        if (estimatedCharPosition > 0) {
            // 尝试找到最近的句子开始位置
            const previousText = currentText.substring(0, estimatedCharPosition);
            const sentenceBreaks = previousText.match(/[.!?。！？]\s*/g);
            
            if (sentenceBreaks && sentenceBreaks.length > 0) {
                // 找到最后一个句子结束标记的位置
                const lastSentenceEndPosition = previousText.lastIndexOf(sentenceBreaks[sentenceBreaks.length - 1]);
                if (lastSentenceEndPosition !== -1) {
                    // 加上句子结束标记的长度，得到下一句的开始位置
                    startPosition = lastSentenceEndPosition + sentenceBreaks[sentenceBreaks.length - 1].length;
                }
            }
        }
        
        // 使用调整后的位置获取剩余文本
        const remainingText = currentText.substring(startPosition);
        console.log('从位置开始播放:', startPosition, '/', currentText.length, '剩余字符数:', remainingText.length);
        
        if (remainingText.trim() === '') {
            console.error('剩余文本为空');
            return;
        }
        
        // 创建语音合成实例
        utterance = new SpeechSynthesisUtterance(remainingText);
        
        // 设置语言
        utterance.lang = isChineseMode ? 'zh-CN' : 'en-US';
        
        // 设置语速
        utterance.rate = currentSpeed;
        
        // 启用文本高亮（需要特殊处理，因为现在我们只播放部分文本）
        if (textHighlighter) {
            // 更新高亮器的容器
            textHighlighter.updateContainer(activeContent);
            
            // 由于我们不能直接高亮部分文本，这里我们可以尝试使用一个偏移量
            const charOffset = startPosition;
            
            // 注册 boundary 事件用于高亮
            utterance.onboundary = function(event) {
                if (event.name === 'word') {
                    // 创建一个修改过的事件对象，添加偏移量
                    const modifiedEvent = {
                        ...event,
                        charIndex: event.charIndex + charOffset
                    };
                    
                    // 将修改过的事件传递给文本高亮器
                    textHighlighter.handleBoundary(modifiedEvent);
                }
            };
            
            // 文本播放结束时清除高亮
            utterance.onend = function() {
                isPlaying = false;
                
                // 清除高亮
                textHighlighter.reset();
                
                // 更新UI
                updatePlayPauseUI(false);
                
                // 停止进度更新
                stopProgressUpdate();
                
                // 将进度重置为100%（完成状态）
                updateProgress(100);
            };
        } else {
            // 设置播放结束事件处理（如果没有高亮器）
            utterance.onend = function() {
                isPlaying = false;
                
                // 更新UI
                updatePlayPauseUI(false);
                
                // 停止进度更新
                stopProgressUpdate();
                
                // 将进度重置为100%（完成状态）
                updateProgress(100);
            };
        }
        
        utterance.onerror = function(event) {
            console.error('语音合成错误:', event);
            isPlaying = false;
            updatePlayPauseUI(false);
            stopProgressUpdate();
            
            // 清除高亮
            if (textHighlighter) {
                textHighlighter.reset();
            }
        };
        
        // 确保之前没有播放
        synth.cancel();
        
        // 开始播放
        synth.speak(utterance);
        isPlaying = true;
        
        // 记录调整后的开始时间
        startTime = Date.now() - (positionInSeconds * 1000);
        
        // 开始更新进度
        startProgressUpdate();
        
        // 更新UI
        updatePlayPauseUI(true);
        
        // 更新进度条
        updateProgress((positionInSeconds / estimatedDuration) * 100);
        
        // 更新当前时间显示
        if (currentTimeEl) {
            currentTimeEl.textContent = formatTime(positionInSeconds);
        }
    }
    
    // 开始周期性更新进度
    function startProgressUpdate() {
        // 清除任何现有的进度更新
        stopProgressUpdate();
        
        // 每100毫秒更新一次进度
        progressUpdateInterval = setInterval(function() {
            if (!isPlaying) {
                stopProgressUpdate();
                return;
            }
            
            // 计算播放进度百分比
            const elapsedTime = (Date.now() - startTime) / 1000;
            const progressPercentage = Math.min(100, (elapsedTime / estimatedDuration) * 100);
            
            // 更新进度
            updateProgress(progressPercentage);
            
            // 更新当前时间显示
            if (currentTimeEl) {
                currentTimeEl.textContent = formatTime(elapsedTime);
            }
        }, 100); // 每100毫秒更新一次
    }
    
    // 更新进度条
    function updateProgress(percentage) {
        if (progressFill) {
            progressFill.style.width = percentage + '%';
        }
    }
    
    // 格式化时间为 mm:ss 格式
    function formatTime(seconds) {
        seconds = Math.max(0, seconds);
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    }
    
    // 更新播放/暂停按钮UI
    function updatePlayPauseUI(isPlaying) {
        if (!playPauseBtn) return;
        
        const icon = playPauseBtn.querySelector('i');
        const text = playPauseBtn.querySelector('span');
        
        if (isPlaying) {
            icon.className = 'fas fa-pause';
            text.textContent = '暂停';
        } else {
            icon.className = 'fas fa-play';
            text.textContent = '播放';
        }
    }
    
    // 暂停语音播放
    function pauseSpeaking() {
        if (synth.speaking && !synth.paused) {
            synth.pause();
            updatePlayPauseUI(false);
            
            // 暂停进度更新
            stopProgressUpdate();
        }
    }
    
    // 继续语音播放
    function continueSpeaking() {
        if (synth.speaking && synth.paused) {
            synth.resume();
            isPlaying = true;
            updatePlayPauseUI(true);
            
            // 调整开始时间以保持进度的连续性
            startTime = Date.now() - (estimatedDuration * (parseFloat(progressFill.style.width) / 100) * 1000);
            
            // 重新开始进度更新
            startProgressUpdate();
        }
    }
    
    // 停止语音播放
    function stopSpeaking() {
        if (synth.speaking) {
            synth.cancel();
            isPlaying = false;
            updatePlayPauseUI(false);
            
            // 停止进度更新
            stopProgressUpdate();
            
            // 将进度重置为100%（完成状态）
            updateProgress(100);
            
            // 清除高亮
            if (textHighlighter) {
                textHighlighter.reset();
            }
        }
    }
    
    // 停止进度更新
    function stopProgressUpdate() {
        if (progressUpdateInterval) {
            clearInterval(progressUpdateInterval);
            progressUpdateInterval = null;
        }
    }
    
    // 语言切换
    if (languageToggle) {
        languageToggle.addEventListener('click', function() {
            isChineseMode = !isChineseMode;
            
            // 切换文章内容显示
            if (isChineseMode) {
                englishContent.classList.remove('active');
                chineseContent.classList.add('active');
                languageToggle.querySelector('span').textContent = '中/英';
                
                // 更新高亮器容器
                if (textHighlighter) {
                    textHighlighter.updateContainer(chineseContent);
                }
            } else {
                chineseContent.classList.remove('active');
                englishContent.classList.add('active');
                languageToggle.querySelector('span').textContent = '英/中';
                
                // 更新高亮器容器
                if (textHighlighter) {
                    textHighlighter.updateContainer(englishContent);
                }
            }
            
            // 如果正在播放，则停止当前播放，但不自动重新开始
            if (isPlaying) {
                stopSpeaking();
            }
        });
    }
    
    // 播放/暂停按钮
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', function() {
            if (!isPlaying) {
                startSpeaking();
            } else {
                if (synth.speaking) {
                    if (synth.paused) {
                        continueSpeaking();
                    } else {
                        pauseSpeaking();
                    }
                } else {
                    // 如果已经结束，重新开始播放
                    startSpeaking();
                }
            }
        });
    }
    
    // 快退15秒按钮
    if (backwardBtn) {
        backwardBtn.addEventListener('click', seekBackward);
    }
    
    // 快进15秒按钮
    if (forwardBtn) {
        forwardBtn.addEventListener('click', seekForward);
    }
    
    // 语速控制
    if (speedControlBtn) {
        speedControlBtn.addEventListener('click', function() {
            // 切换语速
            if (currentSpeed === 1.0) {
                currentSpeed = 1.5;
                this.querySelector('span').textContent = '1.5x';
            } else if (currentSpeed === 1.5) {
                currentSpeed = 2.0;
                this.querySelector('span').textContent = '2.0x';
            } else {
                currentSpeed = 1.0;
                this.querySelector('span').textContent = '1.0x';
            }
            
            // 如果正在播放，则停止当前播放
            if (isPlaying) {
                stopSpeaking();
            }
        });
    }
    
    // 初始化进度条交互
    if (progressBar) {
        // 点击进度条跳转
        progressBar.addEventListener('click', function(e) {
            const rect = progressBar.getBoundingClientRect();
            let percent = ((e.clientX - rect.left) / rect.width) * 100;
            
            // 限制在0-100之间
            percent = Math.max(0, Math.min(100, percent));
            
            // 确保文本内容已初始化
            if (!currentText || currentText === '') {
                // 获取当前显示的文章内容
                const activeContent = isChineseMode ? 
                                   document.querySelector('.chinese-content') : 
                                   document.querySelector('.english-content');
                
                if (activeContent) {
                    currentText = activeContent.textContent.trim();
                }
            }
            
            // 计算新的时间点
            const newTime = (estimatedDuration * percent) / 100;
            console.log('点击进度条，跳转到', newTime, '秒');
            
            // 记录当前播放状态
            const wasPlaying = isPlaying;
            
            // 暂停并取消当前播放
            if (synth.speaking) {
                synth.pause();
                synth.cancel();
            }
            
            // 如果之前是在播放状态，则从新位置继续播放
            if (wasPlaying) {
                // 从新位置开始播放
                startSpeakingFromPosition(newTime);
            } else {
                // 只更新当前时间显示，不开始播放
                if (currentTimeEl) {
                    currentTimeEl.textContent = formatTime(newTime);
                }
                
                // 记录时间点，以便稍后播放
                startTime = Date.now() - (newTime * 1000);
            }
            
            // 更新进度条
            updateProgress(percent);
        });
        
        // 拖动进度条手柄
        if (progressHandle) {
            progressHandle.addEventListener('mousedown', function(e) {
                // 移除只有在播放时才允许拖动的限制
                // if (!isPlaying) return;
                
                e.preventDefault();
                isDragging = true;
                
                // 暂停自动进度更新
                stopProgressUpdate();
                
                // 如果正在播放则暂停语音
                if (isPlaying) {
                    pauseSpeaking();
                }
                
                // 监听鼠标移动
                document.addEventListener('mousemove', handleDrag);
                
                // 监听鼠标松开
                document.addEventListener('mouseup', function mouseUpHandler() {
                    isDragging = false;
                    
                    // 移除事件监听器
                    document.removeEventListener('mousemove', handleDrag);
                    document.removeEventListener('mouseup', mouseUpHandler);
                    
                    // 计算新时间点
                    const currentPercent = parseFloat(progressFill.style.width);
                    const newTime = (estimatedDuration * currentPercent) / 100;
                    
                    // 记录当前播放状态
                    const wasPlaying = isPlaying;
                    console.log('进度条拖动，当前播放状态:', wasPlaying ? '播放中' : '已暂停');
                    console.log('新的播放位置:', newTime, '秒');
                    
                    if (currentPercent > 0 && currentText && currentText !== '') {
                        // 在非零位置，开始播放并更新UI
                        
                        // 暂停并取消当前播放
                        if (synth.speaking) {
                            synth.pause();
                            synth.cancel();
                        }
                        
                        // 如果之前是在播放状态，才重新开始播放
                        if (wasPlaying) {
                            console.log('重新开始播放，并跳转到', newTime, '秒');
                            
                            // 从新位置开始播放
                            startSpeakingFromPosition(newTime);
                        } else {
                            // 只更新当前时间显示，不开始播放
                            if (currentTimeEl) {
                                currentTimeEl.textContent = formatTime(newTime);
                            }
                            
                            // 记录时间点，以便稍后播放
                            startTime = Date.now() - (newTime * 1000);
                        }
                    } else if (currentPercent === 0) {
                        // 如果跳转到开始位置，则重置播放
                        console.log('跳转到开始位置');
                        
                        if (synth.speaking) {
                            synth.pause();
                            synth.cancel();
                        }
                        
                        if (wasPlaying) {
                            // 从头开始播放
                            startSpeaking();
                        } else {
                            // 只更新当前时间显示，不开始播放
                            if (currentTimeEl) {
                                currentTimeEl.textContent = formatTime(0);
                            }
                            
                            // 重置开始时间
                            startTime = Date.now();
                        }
                    }
                });
                
                function handleDrag(e) {
                    const rect = progressBar.getBoundingClientRect();
                    let percent = ((e.clientX - rect.left) / rect.width) * 100;
                    
                    // 限制在0-100之间
                    percent = Math.max(0, Math.min(100, percent));
                    
                    // 确保文本内容已初始化
                    if (!currentText || currentText === '') {
                        // 获取当前显示的文章内容
                        const activeContent = isChineseMode ? 
                                       document.querySelector('.chinese-content') : 
                                       document.querySelector('.english-content');
                        
                        if (activeContent) {
                            currentText = activeContent.textContent.trim();
                        }
                    }
                    
                    // 更新UI进度
                    updateProgress(percent);
                    
                    // 更新当前时间显示
                    const newTime = (estimatedDuration * percent) / 100;
                    currentTimeEl.textContent = formatTime(newTime);
                    
                    // 调整开始时间以反映新位置
                    startTime = Date.now() - (newTime * 1000);
                }
            });
        }
    }
    
    // 在页面卸载时停止所有语音合成
    window.addEventListener('beforeunload', function() {
        synth.cancel();
    });
}

/**
 * 文章收藏功能
 */
function initFavoritesFeature() {
    // 检查是否在我的收藏页面
    const favoritesList = document.getElementById('favoritesList');
    const emptyFavorites = document.getElementById('emptyFavorites');
    if (favoritesList) {
        // 显示收藏的文章列表
        displayFavorites();
    }
    
    // 检查是否在文章详情页面
    const favoriteButton = document.getElementById('favoriteButton');
    if (favoriteButton) {
        // 获取当前文章信息
        const articleTitle = document.querySelector('.article-overlay-title').textContent;
        const articleId = getArticleIdFromUrl() || 'article-1'; // 从URL获取文章ID，或使用默认值
        const articleImage = document.querySelector('.article-banner img').src;
        
        // 检查文章是否已收藏
        const favorites = getFavorites();
        const isAlreadyFavorited = favorites.some(item => item.id === articleId);
        
        // 更新收藏按钮状态
        if (isAlreadyFavorited) {
            favoriteButton.classList.add('favorited');
            favoriteButton.querySelector('i').classList.remove('far');
            favoriteButton.querySelector('i').classList.add('fas');
        }
        
        // 添加点击事件处理
        favoriteButton.addEventListener('click', function() {
            toggleFavorite(articleId, articleTitle, articleImage);
        });
    }
    
    // 确保两种收藏机制之间的一致性
    syncFavoritesStorage();
}

/**
 * 同步两种收藏机制的存储
 */
function syncFavoritesStorage() {
    const favorites = getFavorites();
    const favoriteIds = favorites.map(item => item.id);
    
    // 更新favoriteArticles存储，使其与kidsABC_favorites保持一致
    localStorage.setItem('favoriteArticles', JSON.stringify(favoriteIds));
}

/**
 * 切换文章收藏状态
 * @param {string} articleId - 文章ID
 * @param {string} articleTitle - 文章标题
 * @param {string} articleImage - 文章图片URL
 */
function toggleFavorite(articleId, articleTitle, articleImage) {
    const favorites = getFavorites();
    const favoriteButton = document.getElementById('favoriteButton');
    
    // 检查文章是否已收藏
    const articleIndex = favorites.findIndex(item => item.id === articleId);
    
    if (articleIndex === -1) {
        // 添加到收藏
        const newFavorite = {
            id: articleId,
            title: articleTitle,
            image: articleImage,
            timestamp: new Date().toISOString()
        };
        
        favorites.push(newFavorite);
        localStorage.setItem('kidsABC_favorites', JSON.stringify(favorites));
        
        // 更新按钮状态为已收藏
        favoriteButton.classList.add('favorited');
        favoriteButton.querySelector('i').classList.remove('far');
        favoriteButton.querySelector('i').classList.add('fas');
        
        // 显示收藏成功提示
        showToast('收藏成功！');

        // 同步更新操作区域的收藏按钮状态
        syncFavoriteButtonState(articleId, true);
    } else {
        // 从收藏中移除
        favorites.splice(articleIndex, 1);
        localStorage.setItem('kidsABC_favorites', JSON.stringify(favorites));
        
        // 更新按钮状态为未收藏
        favoriteButton.classList.remove('favorited');
        favoriteButton.querySelector('i').classList.remove('fas');
        favoriteButton.querySelector('i').classList.add('far');
        
        // 显示取消收藏提示
        showToast('已取消收藏');

        // 同步更新操作区域的收藏按钮状态
        syncFavoriteButtonState(articleId, false);
    }
}

/**
 * 同步更新操作区域的收藏按钮状态
 * @param {string} articleId - 文章ID
 * @param {boolean} isFavorited - 是否收藏
 */
function syncFavoriteButtonState(articleId, isFavorited) {
    const favoriteActionButton = document.getElementById('favoriteActionButton');
    if (favoriteActionButton) {
        if (isFavorited) {
            favoriteActionButton.classList.add('active');
        } else {
            favoriteActionButton.classList.remove('active');
        }
        
        // 同步更新favoriteArticles存储
        const favoriteList = JSON.parse(localStorage.getItem('favoriteArticles') || '[]');
        
        if (isFavorited && !favoriteList.includes(articleId)) {
            favoriteList.push(articleId);
        } else if (!isFavorited && favoriteList.includes(articleId)) {
            const index = favoriteList.indexOf(articleId);
            if (index > -1) {
                favoriteList.splice(index, 1);
            }
        }
        
        localStorage.setItem('favoriteArticles', JSON.stringify(favoriteList));
    }
}

/**
 * 获取收藏的文章列表
 * @returns {Array} 收藏的文章数组
 */
function getFavorites() {
    const favoritesJson = localStorage.getItem('kidsABC_favorites');
    return favoritesJson ? JSON.parse(favoritesJson) : [];
}

/**
 * 显示收藏的文章列表
 */
function displayFavorites() {
    const favoritesList = document.getElementById('favoritesList');
    const emptyFavorites = document.getElementById('emptyFavorites');
    
    if (!favoritesList) return;
    
    const favorites = getFavorites();
    
    // 清空当前列表
    favoritesList.innerHTML = '';
    
    if (favorites.length === 0) {
        // 显示空状态
        favoritesList.appendChild(emptyFavorites || createEmptyState());
        return;
    }
    
    // 按时间倒序排列
    favorites.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // 创建收藏列表
    favorites.forEach(article => {
        const articleElement = document.createElement('a');
        articleElement.href = `article-detail-fixed.html?id=${article.id}`;
        articleElement.className = 'reading-item';
        
        const timestamp = new Date(article.timestamp);
        const formattedDate = formatDate(timestamp);
        
        articleElement.innerHTML = `
            <div class="reading-item-info">
                <div class="reading-item-title">${article.title}</div>
                <div class="reading-item-meta">
                    <span><i class="far fa-clock"></i> ${formattedDate}</span>
                </div>
            </div>
        `;
        
        favoritesList.appendChild(articleElement);
    });
}

/**
 * 创建空状态元素
 * @returns {HTMLElement} 空状态DOM元素
 */
function createEmptyState() {
    const emptyState = document.createElement('div');
    emptyState.className = 'reading-empty';
    emptyState.id = 'emptyFavorites';
    emptyState.innerHTML = `
        <i class="fas fa-heart"></i>
        <p>还没有收藏任何文章</p>
        <p>阅读文章时点击❤️即可收藏</p>
    `;
    return emptyState;
}

/**
 * 格式化日期为友好显示
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 30) {
        return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    } else if (diffDay > 0) {
        return `${diffDay}天前`;
    } else if (diffHour > 0) {
        return `${diffHour}小时前`;
    } else if (diffMin > 0) {
        return `${diffMin}分钟前`;
    } else {
        return '刚刚';
    }
}

/**
 * 从URL获取文章ID
 * @returns {string|null} 文章ID或null
 */
function getArticleIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

/**
 * 显示Toast提示
 * @param {string} message - 提示消息
 */
function showToast(message) {
    // 检查是否已有toast元素
    let toast = document.querySelector('.toast-message');
    
    if (!toast) {
        // 创建新的toast元素
        toast = document.createElement('div');
        toast.className = 'toast-message';
        document.body.appendChild(toast);
    }
    
    // 设置消息并显示
    toast.textContent = message;
    toast.classList.add('show');
    
    // 3秒后隐藏
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialize profile page
function initProfilePage() {
    const profilePage = document.getElementById('profile-container');
    if (!profilePage) return;
    
    // Add any profile page specific initialization here
    
    // 更新阅读文章数量
    updateReadingStats();
}

/**
 * 更新阅读统计信息
 */
function updateReadingStats() {
    const readingCountElement = document.querySelector('.stats-grid .stat-item:nth-child(2) .stat-value');
    if (!readingCountElement) return;
    
    // 获取收藏的文章数量
    const favorites = getFavorites();
    readingCountElement.textContent = favorites.length;
}

// 监听localStorage变化，用于调试目的
window.addEventListener('storage', function(e) {
    if (e.key === 'kidsABC_favorites' || e.key === 'favoriteArticles') {
        console.log(`Storage changed: ${e.key}`);
        console.log('Old value:', e.oldValue);
        console.log('New value:', e.newValue);
        
        // 如果在个人资料页面，更新阅读统计
        if (document.getElementById('profile-container')) {
            updateReadingStats();
        }
    }
});
