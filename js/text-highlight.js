/**
 * KidsABC TTS Text Highlighter
 * 实现卡拉OK风格的文本高亮效果
 */

class TextHighlighter {
  constructor(options = {}) {
    this.options = {
      highlightColor: options.highlightColor || '#FF8A65',
      container: options.container || document.querySelector('.english-content'),
      highlightClass: 'tts-highlight',
      synth: window.speechSynthesis,
      utterance: null,
      currentTextNodes: [],
      wordBoundaries: [],
      ...options
    };

    // 创建样式
    this.createStyles();
    
    // 绑定方法到实例
    this.highlight = this.highlight.bind(this);
    this.reset = this.reset.bind(this);
    this.handleBoundary = this.handleBoundary.bind(this);
    this.handleEnd = this.handleEnd.bind(this);
  }

  /**
   * 创建高亮样式
   */
  createStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .${this.options.highlightClass} {
        background-color: ${this.options.highlightColor};
        color: white;
        border-radius: 2px;
        transition: background-color 0.1s ease;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 解析容器中的文本节点
   */
  parseTextNodes() {
    const container = this.options.container;
    if (!container) return [];

    // 清除现有的高亮效果
    this.reset();
    
    // 收集所有文本节点
    const textNodes = [];
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          // 忽略空节点和只有空格的节点
          if (node.textContent.trim() === '') {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }

    return textNodes;
  }

  /**
   * 开始高亮
   * @param {string} text 要高亮和朗读的文本
   * @param {string} lang 语言，例如'en-US'或'zh-CN'
   * @param {number} rate 朗读速度
   */
  highlight(text, lang = 'en-US', rate = 1.0) {
    // 解析节点
    this.options.currentTextNodes = this.parseTextNodes();
    
    // 如果无文本节点，则直接返回
    if (this.options.currentTextNodes.length === 0) return;
    
    // 准备utterance
    this.options.utterance = new SpeechSynthesisUtterance(text);
    this.options.utterance.lang = lang;
    this.options.utterance.rate = rate;
    
    // 重置边界数组
    this.options.wordBoundaries = [];
    
    // 设置事件监听器
    this.options.utterance.onboundary = this.handleBoundary;
    this.options.utterance.onend = this.handleEnd;
    this.options.utterance.onerror = this.handleEnd;
    
    // 开始播放
    this.options.synth.cancel();
    this.options.synth.speak(this.options.utterance);
  }

  /**
   * 处理单词边界事件
   * @param {Event} event 边界事件
   */
  handleBoundary(event) {
    // Web Speech API的边界事件
    if (event.name === 'word') {
      // 记录单词边界位置
      this.options.wordBoundaries.push({
        charIndex: event.charIndex,
        charLength: event.charLength || (event.charIndex - (this.options.wordBoundaries[this.options.wordBoundaries.length - 1]?.charIndex || 0))
      });
      
      // 执行高亮
      this.highlightText(event.charIndex, event.charLength);
    }
  }

  /**
   * 根据字符索引和长度高亮文本
   * @param {number} charIndex 开始字符索引
   * @param {number} charLength 字符长度
   */
  highlightText(charIndex, charLength) {
    // 清除之前的高亮
    this.clearHighlights();
    
    // 找到包含目标字符的文本节点
    let currentTextContent = '';
    let targetNode = null;
    let relativeIndex = charIndex;
    
    for (const node of this.options.currentTextNodes) {
      const nodeTextLength = node.textContent.length;
      
      if (currentTextContent.length + nodeTextLength > charIndex) {
        targetNode = node;
        relativeIndex = charIndex - currentTextContent.length;
        break;
      }
      
      currentTextContent += node.textContent;
    }
    
    if (!targetNode) return;
    
    // 计算实际长度，如果未提供
    if (!charLength) {
      // 尝试找到空格或标点作为单词的边界
      const text = targetNode.textContent;
      let endPos = relativeIndex;
      while (endPos < text.length && !/[\s,.!?;:)}\]]/g.test(text[endPos])) {
        endPos++;
      }
      charLength = endPos - relativeIndex;
    }
    
    // 创建高亮的span
    const range = document.createRange();
    const span = document.createElement('span');
    span.classList.add(this.options.highlightClass);
    
    try {
      // 设置范围
      range.setStart(targetNode, relativeIndex);
      range.setEnd(targetNode, relativeIndex + charLength);
      
      // 将范围内容替换为带有高亮的span
      range.surroundContents(span);
    } catch (error) {
      console.warn('高亮失败:', error);
    }
  }

  /**
   * 清除所有高亮
   */
  clearHighlights() {
    const highlights = document.querySelectorAll('.' + this.options.highlightClass);
    
    highlights.forEach(highlight => {
      // 获取span的内容
      const text = highlight.textContent;
      // 创建文本节点
      const textNode = document.createTextNode(text);
      // 替换span
      highlight.parentNode.replaceChild(textNode, highlight);
    });
  }

  /**
   * 处理朗读结束事件
   */
  handleEnd() {
    // 清除高亮
    this.clearHighlights();
    
    // 重置状态
    this.options.currentTextNodes = [];
    this.options.wordBoundaries = [];
  }

  /**
   * 重置所有高亮和状态
   */
  reset() {
    // 停止当前朗读
    this.options.synth.cancel();
    
    // 清除高亮
    this.clearHighlights();
    
    // 重置状态
    this.options.currentTextNodes = [];
    this.options.wordBoundaries = [];
    this.options.utterance = null;
  }

  /**
   * 更新容器
   * @param {HTMLElement} container 新的容器元素
   */
  updateContainer(container) {
    // 重置当前状态
    this.reset();
    
    // 更新容器
    this.options.container = container;
  }

  /**
   * 更新高亮颜色
   * @param {string} color 新的高亮颜色
   */
  updateHighlightColor(color) {
    this.options.highlightColor = color;
    this.createStyles();
  }
}
