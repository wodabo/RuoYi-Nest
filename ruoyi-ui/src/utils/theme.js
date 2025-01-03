import store from '@/store'

export default {
    // 当前主题
    currentTheme: 'light',
  
    // 可用主题列表
    themes: [
      { key: 'light', name: '默认主题' },
      { key: 'dark', name: '暗色主题' },
    ],
  
    // 切换主题
    changeTheme(theme) {
      document.documentElement.setAttribute('theme-mode', theme)
      this.currentTheme = theme
    },
  
    // 获取当前主题的所有CSS变量
    getThemeVariables() {
      const styles = getComputedStyle(document.documentElement)
      return [...styles].reduce((vars, prop) => {
        if (prop.startsWith('--')) {
          vars[prop] = styles.getPropertyValue(prop).trim()
        }
        return vars
      }, {})
    },
  
    // 初始化主题
    initTheme() {
      const savedTheme = store.state.settings.themeMode || 'dark'
      this.changeTheme(savedTheme)
    }
  }