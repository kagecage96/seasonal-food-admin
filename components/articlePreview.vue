<template lang="pug">
    el-card.ArticlePreview
        div(slot="header" class="ArticlePreview_TitleContainer")
            div.ArticlePreview_Title {{article.title}}
        div.ArticlePreview_ContentsContainer
            div(v-for="contentsObj in contentsList" :key="contentsObj.index" class="ArticlePreview_Content")
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
.ArticlePreview {
    width: 40%;
    min-height: 300px;
    overflow: scroll;
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
        word-break: break-all;
    }
}
</style>