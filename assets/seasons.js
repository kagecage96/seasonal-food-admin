export default {
    data() {
        const seasons = [...Array(12).keys()].map(num => {
            return {
                label: String(num + 1) + '月',
                value: num
            }
        })
        return {
            seasons: seasons
        }
    },
}















































