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
            el-button(type="danger" class="ArticleEditModal_SubmitButton" @click.self="editArticle") Update
</template>

<script>
import SubCategory from '~/components/SubCategory'
export default {
    data() {
        return {
            articleTitle: '',
            categories: [
                {
                    id: '',
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
            default: 'japanese'
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
        editArticle() {
            const article = {
                id: this.article.id,
                title: this.articleTitle,
                sub_categories: this.categoryFilter()
            }
            this.$emit('update', article)
        },
        categoryFilter() {
            // Return valid sub-category (has title and no-empty content)
            this.categories = this.categories.filter(category => {
                if(category.title.length == 0) return false
                category.contents = category.contents.filter(content => {
                    if(content) return content
                })
                return category
            })
            return this.categories
        },
        addSubCategory() {
            const categoryInit = {
                index: this.categories.length,
                    title: '',
                    contents: ['']
                }
            this.categories.push(categoryInit)
        },
        addContent(index) {
            this.categories[index].contents.push('')
        },
        closeModal() {
            this.$emit('close')
        },
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
        display: flex;
        flex-direction: column;
    }
    &_SubCategory {
        &:nth-last-of-type(n+2) {
            margin-bottom: 20px;
        }
    }
    &_FormItemContainer {
        margin-bottom: 20px;
        &:last-of-type {
            margin-bottom: 80px;
        }
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
    &_SubmitButton {
        margin-top: auto;
    }
}
</style>