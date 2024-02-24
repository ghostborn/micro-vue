(function (root) {
  // MiniVue构造函数 参数是一个对象
  function MiniVue(options) {
    // 存放观察者实例
    this._watchers = []
    // 存放文本节点 在compile上会用到
    this._textNodes = []
    this.$options = options
    this.init()
  }

  // 原型方法
  MiniVue.prototype = {
    // 初始化数据和方法
    init() {
      this.initData()
      this.initMethods()
      // 监听数据
      new Observer(this._data)

      this.initWatch()

    },
    initData() {
      const vm = this
      vm.$el = document.querySelector(vm.$options.el)
      let data = vm.$options.data
      data = vm._data = typeof data === 'function' ? data() : data || {}
      const keys = Object.keys(data)
      // 对每一个key实现代理 即可通过vm.msg来访问vm._data.msg
      keys.forEach(e => {
        vm.proxy(vm, '_data', e)
      })
    },
    initMethods() {
      const vm = this
      const methods = vm.$options.methods ? vm.$options.methods : {}
      const keys = Object.keys(methods)
      // 将methods上的方法赋值到vm实例上
      keys.forEach(e => {
        vm[e] = methods[e]
      })
    },
    initWatch() {
      if (this.$options.watch) {
        const watch = this.$options.watch
        const keys = Object.keys(watch)
        keys.forEach(key => {
          this.$watch(key, watch[key])
        })
      }
    },


    proxy(target, sourceKey, key) {
      const sharedPropertyDefinition = {
        enumerable: true,
        configurable: true
      }
      // 实际上读取和返回的是vm._data上的数据
      sharedPropertyDefinition.get = function proxyGetter() {
        return this[sourceKey][key]
      }
      sharedPropertyDefinition.set = function proxySetter(val) {
        this[sourceKey][key] = val
      }
      Object.defineProperty(target, key, sharedPropertyDefinition)
    },

    $watch(variable, callback) {
      new Watcher(this, variable, callback)
    }


  }

  // 对数据进行监听
  function Observer(obj) {
    this.walk(obj)
  }

  Observer.prototype = {
    walk(obj) {
      const keys = Object.keys(obj)
      for (let i = 0, len = keys.length; i < len; i++) {
        defineReactive(obj, keys[i], obj[keys[i]])
      }
    }
  }

  function defineReactive(obj, key, val) {

  }

  // watcher实例的ID 每个watcher实现的ID都是唯一的
  let uid = 0

  // expOrFn为表达式或一个变量名
  function Watcher(vm, expOrFn, callback) {
    vm._watchers.push(this)
    this.id = uid++
    this.vm = vm
    // 存放dep实例
    this.deps = []
    // 存放dep的ID
    this.depIds = new Set()
    // 更新触发回调函数
    this.cb = callback

    this.getter = () => vm[expOrFn]
    this.setter = (val) => {
      vm[expOrFn] = val
    }
    // 在创建watcher实例时先取一次值
    this.value = this.get()
  }

  Watcher.prototype = {
    get() {
      // 在读取值时先将观察者对象赋值给Dep.target 否则Dep.target为空不会触发收集依赖
      Dep.target = this
      const value = this.getter()
      // 触发依赖后置空
      Dep.target = null
      return value
    }
  }


  // dep实例的ID
  let did = 0
  // Dep.target为watcher实例
  Dep.target = null

  function Dep() {
    this.id = did++
    this.subs = []
  }

  Dep.prototype = {
    depend() {
      if (Dep.target) {
        Dep.target.addDep(this)
      }
    }
  }


})(window)
