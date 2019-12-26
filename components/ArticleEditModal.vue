<template lang="pug">
    div.ArticleEditModal
        div(@click.self="closeModal" class="ArticleEditModal_Layer")
        div.ArticleEditModal_Container
            el-form(ref="ArticleForm" @submit.prevent="" class="ArticleEditModal_FormContainer")
                div.ArticleEditModal_FormItemContainer
                    h2.ArticleEditModal_FormItemLabel._isTitle Edit Article
                div.ArticleEditModal_FormItemContainer
                    div.ArticleEditModal_FormItemLabel ArticleTitle
                    el-input(v-model="articleTitle")
                div.ArticleEditModal_FormItemContainer
                    div.ArticleEditModal_FormItemLabel Sub_categories
                    div.ArticleEditModal_SubCategoryContainer
                        Sub-Category(v-for="(category, index) in categories"
                                    :key="category.id"
                                    :index="index"
                                    :subcategory="category"
                                    @add="addContent(index)"
                                    @delete="deleteSubCategory(index, category)"
                                    class="ArticleEditModal_SubCategory")
                    div.ArticleEditModal_AddSubCategoryButton
                        el-button(@click="addSubCategory" type="info" icon="el-icon-plus" circle)
                div.ArticleEditModal_FormItemContainer
                    el-button(type="danger" class="ArticleEditModal_SubmitButton" @click="editArticle" :disabled="isDisabled") Update
            article-preview(:article="articleData" class="ArticleCreateModal_PreviewContainer")

</template>

<script>
import ArticlePreview from '~/components/ArticlePreview'
import SubCategory from '~/components/SubCategory'
import { db, firebase } from '~/plugins/firebase.js'
import loading from '~/assets/loading.js'

export default {
    mixins: [loading],
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
            ],
            deleteCategoryIds: [],
            isDisabled: false
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
        SubCategory,
        ArticlePreview
    },
    computed: {
        articleData() {
            let content = Array.from(this.categories)
            return {
                title: this.articleTitle,
                content: this.categoryFilter(content)
            }
        },
    },
    watch: {
        article() {
            this.articleTitle = this.article.title
            this.categories = Array.from(this.article.content)
        }
    },
    methods: {
        editArticle() {
            const article = {
                id: this.article.id,
                title: this.articleTitle,
                sub_categories: this.categoryFilter(this.categories)
            }
            this.isDisabled = true
            this.$emit('update', {article: article, deleteIds: this.deleteCategoryIds})
        },
        categoryFilter(categories) {
            // Return valid sub-category (has title and no-empty content)
            categories = categories.filter((category, index) => {
                if(category.title.length == 0) return false
                category.contents = category.contents.filter(content => {
                    if(content) return content
                })
                category['index'] = index
                return category
            })
            return categories
        },
        addSubCategory() {
            const categoryInit = {
                    index: this.categories.length,
                    title: '',
                    contents: ['']
                }
            this.categories.push(categoryInit)
        },
        async deleteSubCategory(index, category) {
            const target = document.body.getElementsByClassName('ArticleEditModal_SubCategory')[index]
            this.loadingToElement(target, '#ffffff80')
            this.loadingStop()
            if(category.hasOwnProperty('id')) {
                this.deleteCategoryIds.push(category.id)
            }
            this.categories.splice(index, 1)
        },
        addContent(index) {
            this.categories[index].contents.push('')
        },
        init() {
            this.deleteCategoryIds = []
            this.articleTitle = this.article.title
            this.categories = Array.from(this.article.content)
            this.isDisabled = false
        },
        closeModal() {
            this.$emit('close')
            this.init()
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
        width: 90%;
        top: 30px;
        bottom: 30px;
        left: 0;
        right: 0;
        background: white;
        margin: auto;
        padding: 50px 80px;
        overflow: scroll;
        display: flex;
    }
    &_FormContainer {
        overflow: scroll;
        flex-grow: 1;
        margin-right: 50px;
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