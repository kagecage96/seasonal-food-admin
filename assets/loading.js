import { Loading } from 'element-ui';
export default {
    data () {
        return {
            loadingInstance: '',
        }
    },
    methods: {
        loadingToClass(class_name, background = 'transparent') {
            const target = document.body.getElementsByClassName(class_name)[0]
            this.loadingStart(target, background)
        },
        loadingToElement(element, background = 'transparent') {
            this.loadingStart(element, background)
        },
        loadingStart(target, background) {
            const past_loadings = target.getElementsByClassName('el-loading-mask')
            for (let i = 0; i < past_loadings.length; i++ ) {
                past_loadings[i].remove()
            }
            this.loadingInstance = Loading.service(
                {
                    target: target,
                    fullscreen: false,
                    background: background,
                });
        },
        loadingStop() {
            this.$nextTick(() => {
                if(this.loadingInstance) this.loadingInstance.close();
            });
        }
    }
}