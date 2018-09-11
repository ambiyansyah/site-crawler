module.exports = {
    is_blacklist: function (target, pattern) {
        var value = 0;

        pattern.forEach(function (word) {
            value = value + target.includes(word);
        });

        return (value === 1);
    }
};