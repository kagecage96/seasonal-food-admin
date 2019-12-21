<template lang="pug">
    div.ArticleEditModal
        div(@click.self="closeModal" class="ArticleEditModal_Layer")
        el-form(ref="ArticleForm" @submit.prevent="" class="ArticleEditModal_Container")
            div.ArticleEditModal_FormItemContainer
                h2.ArticleEditModal_FormItemLabel._isTitle Edit Article
            div.ArticleEditModal_FormItemContainer
                div.ArticleEditModal_FormItemLabel ArticleTitle
                el-input(v-model="articleTitle")
            div.ArticleEditModal_FormItemContainer
                div.ArticleEditModal_FormItemLabel Sub_categories
                div.ArticleEditModal_SubCategoryContainer
                    Sub-Category(v-for="(category, index) in categories"
                                :key="index"
                                :subcategory="category"
                                @add="addContent(index)"
                                class="ArticleEditModal_SubCategory")
                div.ArticleEditModal_AddSubCategoryButton
                    el-button(@click="addSubCategory" type="info" icon="el-icon-plus" circle)
            el-button(type="danger" @click="EditArticle") Update
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
        },
        article: {
            type: Object,
            required: true
        }
    },
    components: {
        SubCategory
    },
    watch: {
        article() {
            this.articleTitle = this.article.title
            this.categories = this.article.content
        }
    },
    methods: {
        closeModal() {
            this.$emit('close')
        },
        addSubCategory() {
            const categoryInit = {
                    index: this.categories.length,
                    title: '',
                    contents: ['']
                }
            this.categories.push(categoryInit)
        },
        EditArticle() {
            console.log(this.$refs.ArticleForm)
        },
        addContent(index) {
            this.categories[index].contents.push('')
        }
    }
}
</script>

<style lang="scss" scoped>
.ArticleEditModal {
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