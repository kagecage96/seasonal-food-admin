<template lang="pug">
    el-card.ArticleCard
        div(slot="header" class="ArticleCard_TitleContainer")
            div.ArticleCard_Title {{article.title}}
            div.ArticleCard_ButtonWrapper
                el-button(type="danger" plain @click="deleteArticle") delete
                el-button(type="primary" plain @click="showEditModal") edit
        div.ArticleCard_ContentsContainer
            div(v-for="contentsObj in contentsList" :key="contentsObj.index" class="ArticleCard_Content")
                div {{contentsObj.title}}
                div(v-for="(content, index) in contentsObj.contents" :key="index") {{content}}
</template>

<script>
export default {
    props: {
        article: {
            type: Object,
            required: true
        }
    },
    computed: {
        contentsList() {
            return this.article.content.sort(this.compare)
        }
    },
    methods: {
        showEditModal() {
            this.$emit('show')
        },
        deleteArticle() {
            this.$emit('delete')
        },
        compare(a, b) {
            let comparison = 0;
            if (a.index > b.index) {
                comparison = 1;
            } else if (a.index < b.index) {
                comparison = -1;
            }
            return comparison;
        }
    }
}
</script>

<style lang="scss" scoped>
.ArticleCard {
    min-width: 350px;
    min-height: 300px;
    &_TitleContainer {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    &_Title {
        word-break: break-all;
        padding-right: 10px;
    }
    &_ButtonWrapper {
        flex-shrink: 0;
    }
    &_Content {
        margin-bottom: 10px;
    }
}
</style>