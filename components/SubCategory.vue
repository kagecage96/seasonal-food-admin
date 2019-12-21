<template lang="pug">
    div.SubCategory
        div.SubCategory_ItemContainer index: {{subcategory.index}}
        div.SubCategory_ItemContainer
            div.SubCategory_Title
                div.SubCategory_ContentsFormItem Subcategory title
                el-input(v-model="subcategory.title" class="SubCategory_ContentsFormItem")
        div.SubCategory_ItemContainer
            div.SubCategory_ContentsFormItem Contents
            div(v-for="(content, index) in subcategory.contents" :key="index" class="SubCategory_ContentsFormItem")
                div.SubCategory_ContentsFormLabel [{{index}}]:
                el-input(
                    type="textarea"
                    :autosize="{ minRows: 2, maxRows: 8}"
                    v-model="subcategory.contents[index]" autosize) {{content}}
            el-button(class="SubCategory_AddContentButton" @click="addContent") Add content
</template>

<script>
export default {
    props: {
        subcategory: {
            type: Object,
            required: true
        }
    },
    methods: {
        addContent() {
            this.$emit('add')
        }
    }
}
</script>

<style lang="scss" scoped>
.SubCategory {
    border: solid 1px #d3d3d3;
    background: #f8f8f8;
    padding: 30px;
    &_ItemContainer {
        display: flex;
        flex-direction: column;
        &:nth-last-of-type(n+2) {
            margin-bottom: 20px;
        }
    }
    &_ContentsFormItem {
        display: flex;
        margin-bottom: 10px;
    }
    &_ContentsFormLabel {
        margin-right: 10px;
    }
    &_AddContentButton {
        margin-left: auto;
    }
}

</style>