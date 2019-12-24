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
                                :index="index"
                                :subcategory="category"
                                @add="addContent(index)"
                                @delete="deleteSubCategory(index, category)"
                                class="ArticleEditModal_SubCategory")
                div.ArticleEditModal_AddSubCategoryButton
                    el-button(@click="addSubCategory" type="info" icon="el-icon-plus" circle)
            el-button(type="danger" class="ArticleEditModal_SubmitButton" @click="editArticle" :disabled="isDisabled") Update
</template>

<script>
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
            this.isDisabled = true
            this.$emit('update', article)
        },
        categoryFilter() {
            // Return valid sub-category (has title and no-empty content)
            this.categories = this.categories.filter((category, index) => {
                if(category.title.length == 0) return false
                category.contents = category.contents.filter(content => {
                    if(content) return content
                })
                category['index'] = index
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
        async deleteSubCategory(index, category) {
            const target = document.body.getElementsByClassName('ArticleEditModal_SubCategory')[index]
            this.loadingToElement(target, '#ffffff80')
            if(!category.id) {
                this.loadingStop()
                this.categories.splice(index, 1)
            } else {
                await db.collection(`Articles/${this.article.id}/sub_categories`).doc(category.id).delete()
                .then(()=>{
                    this.categories.splice(index, 1)
                    this.loadingStop()
                    let sub_categories = this.categoryFilter()
                    sub_categories.forEach(category => {
                        let category_copy = JSON.parse(JSON.stringify(category))
                        if(category.hasOwnProperty('id')) {
                            delete category_copy.id
                            db.collection(`Articles/${this.article.id}/sub_categories`).doc(category.id).update(category_copy)
                        }else{
                            db.collection(`Articles/${this.article.id}/sub_categories`).add(category)
                        }
                    })
                })
                .catch(error => {
                    alert('Error! show error details on console.')
                    console.log(error)
                })
            }
        },
        addContent(index) {
            this.categories[index].contents.push('')
        },
        closeModal() {
            this.isDisabled = false
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