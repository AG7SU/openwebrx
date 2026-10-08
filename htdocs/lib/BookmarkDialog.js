$.fn.bookmarkDialog = function() {
    var $el = this;
    return {
        setModes: function(modes) {
            var options = modes.map(function(m) {
                return $('<option>').val(m.modulation).text(m.name)[0];
            });
            $el.find('#modulation').empty().append(options);
            return this;
        },
        setUnderlying: function(modes) {
            var options = [ $('<option value="">None</option>') ].concat(modes.filter(function(m) {
                return !m.underlying && m.type === 'analog';
            }).map(function(m) {
                return $('<option>').val(m.modulation).text(m.name)[0];
            }));
            $el.find('#underlying').empty().append(options);
            return this;
        },
        setValues: function(bookmark) {
            var $form = $el.find('form');
            ['name', 'frequency', 'modulation', 'underlying', 'description', 'scannable'].forEach(function(key) {
                var $input = $form.find('#' + key);
                if ($input.is(':checkbox')) {
                    $input.prop('checked', bookmark[key]);
                } else {
                    $input.val(bookmark[key]);
                }
            });
            $el.data('id', bookmark.id || false);
            return this;
        },
        getValues: function() {
            var bookmark = {};
            var valid = true;
            ['name', 'frequency', 'modulation', 'underlying', 'description', 'scannable'].forEach(function(key) {
                var $input = $el.find('#' + key);
                valid = valid && $input[0].checkValidity();
                bookmark[key] = $input.is(':checkbox')? $input.is(':checked') : $input.val();
            });
            if (!valid) {
                $el.find("form :submit").click();
                return;
            }
            bookmark.id = $el.data('id');
            return bookmark;
        }
    }
};
