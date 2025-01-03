import { createVuePlugin as vue } from "vite-plugin-vue2";
import vueJsx from '@vitejs/plugin-vue2-jsx'
import {defineConfig, loadEnv} from 'vite'
import path from 'path'
import elementUIVersion from 'element-ui/package.json'
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";

const port = process.env.port || process.env.npm_config_port || 80 // 端口

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, __dirname, '')
    return {
        // 部署生产环境和开发环境下的URL。
        // 默认情况下，Vue CLI 会假设你的应用是被部署在一个域名的根路径上
        // 例如 https://www.ruoyi-nest.vip/。如果应用被部署在一个子路径上，你就需要用这个选项指定这个子路径。例如，如果你的应用被部署在 https://www.ruoyi-nest.vip/admin/，则设置 baseUrl 为 /admin/。
        base:'/',
        plugins: [
            vue(),
            vueJsx(),
            createSvgIconsPlugin({
                iconDirs: [path.resolve(__dirname, "src/assets/icons/svg")], // svg文件位置
                symbolId: "icon-[name]",
                svgoOptions: {
                    multipass: true,  // 多次优化
                    plugins: [
                      {
                        name: 'removeAttrs',
                        params: {
                          attrs: [
                            'fill',
                            'fill-rule'
                          ]
                        }
                      }
                    ]
                }
              }),
        ],
        define: {
            'process.env.ELEMENT_VERSION': JSON.stringify(elementUIVersion.version),
            'APP_NAME': JSON.stringify('RuoYi Admin')
        },
        resolve: {
            extensions: [".vue", ".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
            alias:{
                "@": path.resolve(__dirname, "./src"),
                "~": path.resolve(__dirname, "./node_modules"),
                "vue": "vue/dist/vue.esm.js"
            },
        },
        build: {
            commonjsOptions: {
                  // 这将允许 CommonJS 模块被转换
                // transformMixedEsModules: true,
                // exclude: [
                //     'node_modules/lodash-es/**',
                //     'node_modules/@types/lodash-es/**',
                // ],
            },
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        if (id.includes('node_modules')) {
                            return id.toString().split('node_modules/')[1]
                                .split('/')[0].toString();
                        }
                    }
                }
            },
            cssCodeSplit: true, //  如果设置为false，整个项目中的所有 CSS 将被提取到一个 CSS 文件中
            sourcemap: true, // 构建后是否生成 source map 文件。如果为 true，将会创建一个独立的 source map 文件
            target: 'modules', // 设置最终构建的浏览器兼容目标。默认值是一个 Vite 特有的值——'modules'  还可设置为 'es2015' 'es2016'等
            chunkSizeWarningLimit: 550, // 单位kb  打包后文件大小警告的限制 (文件大于此此值会出现警告)
            assetsInlineLimit: 4096, // 单位字节（1024等于1kb） 小于此阈值的导入或引用资源将内联为 base64 编码，以避免额外的 http 请求。设置为 0 可以完全禁用此项。
            minify: 'terser', // 'terser' 相对较慢，但大多数情况下构建后的文件体积更小。'esbuild' 最小化混淆更快但构建后的文件相对更大。
            terserOptions: {
                compress: {
                    drop_console: true, // 生产环境去除console
                    drop_debugger: true, // 生产环境去除debugger
                },
            }
        },
        optimizeDeps: {
            // lodash-es 是vite自带的引用，optimizeDeps代表预构建;
            // 默认情况下，不在 node_modules 中的，链接的包不会被预构建,include代表强制预构建
            // include: ['element-plus', 'lodash-es'],
        },
        server: {
            host: '0.0.0.0',
            port: port,
            open: true,
            cors: true, // 允许跨域
            proxy: {
                [env.VITE_APP_BASE_API]: {
                    target: `http://localhost:3000`,
                    changeOrigin: true,
                    configure: (proxy, options) => {
                        proxy.on('proxyReq', (proxyReq, req, res) => {
                          console.log('代理请求:', req.method, req.url)
                        })
                        proxy.on('proxyRes', (proxyRes, req, res) => {
                          console.log('代理响应:', proxyRes.statusCode, req.url)
                        })
                      },
                      rewrite: (path) => path.replace(new RegExp('^' + env.VITE_APP_BASE_API), '')
                }
            },
            disableHostCheck: true
        },
    }
})

