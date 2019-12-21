<template lang="pug">
    div.ArticleCreateModal
        div(@click.self="closeModal" class="ArticleCreateModal_Layer")
        el-form(ref="ArticleForm" @submit.prevent="" class="ArticleCreateModal_Container")
            div.ArticleCreateModal_FormItemContainer
                h2.ArticleCreateModal_FormItemLabel._isTitle Create a new Article_ {{lang}}
            div.ArticleCreateModal_FormItemContainer
                div.ArticleCreateModal_FormItemLabel ArticleTitle
                el-input(v-model="articleTitle")
            div.ArticleCreateModal_FormItemContainer
                div.ArticleCreateModal_FormItemLabel Sub_categories
                div.ArticleCreateModal_SubCategoryContainer
                    Sub-Category(v-for="(category, index) in categories"
                                :key="index"
                                :subcategory="category"
                                @add="addContent(index)"
                                class="ArticleCreateModal_SubCategory")
                div.ArticleCreateModal_AddSubCategoryButton
                    el-button(@click="addSubCategory" type="info" icon="el-icon-plus" circle)
            el-button(type="primary" @click="createArticle") Create
</template>

<script>
import SubCategory from '~/components/SubCategory'
export default {
    data() {
        return {
            articleTitle: '',
            categories: [
                {
                    index: 0,
                    title: '',
                    contents: ['']
                }
            ]
        }
    },
    props: {
        lang: {
            type: String,
            required: true,
            default: 'jp'
        }
    },
    components: {
        SubCategory
    },
    methods: {
        closeModal() {
            this.$emit('close')
            this.initSubCategory()
        },
        initSubCategory() {
            this.articleTitle = '',
            this.categories = [
                {
                    index: 0,
                    title: '',
                    contents: ['']
                }
            ]
        },
        addSubCategory() {
            const categoryInit = {
                    index: this.categories.length,
                    title: '',
                    contents: ['']
                }
            this.categories.push(categoryInit)
        },
        createArticle() {
            console.log(this.$refs.ArticleForm)
        },
        addContent(index) {
            this.categories[index].contents.push('')
        }
    }
}
</script>

<style lang="scss" scoped>
.ArticleCreateModal {
    &_Layer {
        position: fixed;
        background: #00000047;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        cursor: pointer;
    }
    &_Container {
        position: fixed;
        z-index: 2;
        width: 80%;
        top: 30px;
        bottom: 30px;
        left: 0;
        right: 0;
        background: white;
        margin: auto;
        padding: 50px 80px;
        overflow: scroll;
    }
    &_SubCategory {
        &:nth-last-of-type(n+2) {
            margin-bottom: 20px;
        }
    }
    &_FormItemContainer {
        margin-bottom: 20px;
    }
    &_FormItemLabel {
        margin-bottom: 10px;
        &._isTitle {
            margin-bottom: 50px;
        }
    }
    &_SubCategoryContainer {
        margin-bottom: 20px;
    }
    &_AddSubCategoryButton {
        text-align: center;
    }
}
</style>