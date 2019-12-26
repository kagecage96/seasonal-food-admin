<template lang="pug">
    div.ArticleCreateModal
        div.ArticleCreateModal_FormWrapper
            div(@click.self="closeModal" class="ArticleCreateModal_Layer")
            div.ArticleCreateModal_Container
                el-form(ref="ArticleForm" @submit.prevent="" class="ArticleCreateModal_FormContainer")
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
                                        :index="index"
                                        :subcategory="category"
                                        @delete="deleteSubCategory(index, category)"
                                        @add="addContent(index)"
                                        class="ArticleCreateModal_SubCategory")
                        div.ArticleCreateModal_AddSubCategoryButton
                            el-button(@click="addSubCategory" type="info" icon="el-icon-plus" circle)
                    div.ArticleCreateModal_FormItemContainer
                        el-button(type="primary" class="ArticleCreateModal_SubmitButton" @click="createArticle" :disabled="articleTitle.length == 0 || isDisabled") Create
                article-preview(:article="articleData" class="ArticleCreateModal_PreviewContainer")
</template>

<script>
import ArticlePreview from '~/components/ArticlePreview'
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
            ],
            isDisabled: false
        }
    },
    props: {
        lang: {
            type: String,
            required: true,
            default: 'japanese'
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
        }
    },
    methods: {
        createArticle() {
            const articleFormat = {
                profile: {
                    language: this.lang,
                    title: this.articleTitle,
                    ingredient_id: ""
                },
                sub_categories: this.categoryFilter(this.categories)
            }
            this.isDisabled = true
            this.$emit('create', articleFormat)
        },
        categoryFilter(categories) {
            // Return valid sub-category (has title and no-empty content)
            categories = categories.filter(category => {
                if(category.title.length == 0) return false
                category.contents = category.contents.filter(content => {
                    if(content) return content
                })
                return category
            })
            return categories
        },
        initSubCategory() {
            this.isDisabled = false,
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
        deleteSubCategory(index, category) {
            this.categories.splice(index, 1)
        },
        addContent(index) {
            this.categories[index].contents.push('')
        },
        closeModal() {
            this.$emit('close')
            this.initSubCategory()
        },
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
        justify-content: space-between;
    }
    &_FormContainer {
        overflow: scroll;
        flex-grow: 1;
        margin-right: 50px;
    }
    &_PreviewContainer {
        flex-shrink: 0;
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
        width: 100%;
    }
}
</style>