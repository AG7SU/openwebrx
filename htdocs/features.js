var FeatureReport = (function() {
    var allowedTags = new Set([
        'a', 'blockquote', 'br', 'code', 'del', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'hr', 'i', 'li', 'ol', 'p', 'pre', 's', 'strong', 'ul'
    ]);
    var blockedTags = new Set(['iframe', 'math', 'object', 'script', 'style', 'svg', 'template']);

    function safeLink(value) {
        try {
            var url = new URL(value, document.baseURI);
            if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
            return url.href;
        } catch (e) {
            return null;
        }
    }

    function appendMarkdown(target, markdown, converter) {
        var template = document.createElement('template');
        template.innerHTML = converter.render(String(markdown == null ? '' : markdown));

        function copyNode(source, destination) {
            if (source.nodeType === Node.TEXT_NODE) {
                destination.appendChild(document.createTextNode(source.nodeValue));
                return;
            }
            if (source.nodeType !== Node.ELEMENT_NODE) return;

            var tag = source.tagName.toLowerCase();
            if (blockedTags.has(tag)) return;
            if (!allowedTags.has(tag)) {
                Array.from(source.childNodes).forEach(function(child) {
                    copyNode(child, destination);
                });
                return;
            }

            var clean = document.createElement(tag);
            if (tag === 'a') {
                var href = safeLink(source.getAttribute('href') || '');
                if (href) {
                    clean.href = href;
                    clean.target = '_blank';
                    clean.rel = 'noopener noreferrer';
                }
            }
            Array.from(source.childNodes).forEach(function(child) {
                copyNode(child, clean);
            });
            if (tag === 'a' && !clean.hasAttribute('href')) {
                Array.from(clean.childNodes).forEach(function(child) {
                    destination.appendChild(child);
                });
            } else {
                destination.appendChild(clean);
            }
        }

        Array.from(template.content.childNodes).forEach(function(node) {
            copyNode(node, target);
        });
    }

    function statusCell(available) {
        var cell = document.createElement('td');
        cell.style.color = available ? '#00FF00' : '#FF0000';
        cell.textContent = available ? 'YES' : 'NO';
        return cell;
    }

    function render(data, body, converter) {
        body.replaceChildren();
        Object.entries(data || {}).forEach(function(entry) {
            var name = entry[0];
            var details = entry[1] || {};
            var row = document.createElement('tr');
            var nameCell = document.createElement('td');
            var label = document.createElement('b');
            nameCell.colSpan = 2;
            label.textContent = name;
            nameCell.appendChild(label);
            row.append(nameCell, statusCell(details.available));
            body.appendChild(row);

            Object.entries(details.requirements || {}).forEach(function(requirement) {
                var requirementName = requirement[0];
                var requirementDetails = requirement[1] || {};
                var requirementRow = document.createElement('tr');
                var requirementCell = document.createElement('td');
                var descriptionCell = document.createElement('td');
                requirementCell.style.paddingLeft = '3em';
                requirementCell.textContent = requirementName;
                appendMarkdown(descriptionCell, requirementDetails.description, converter);
                requirementRow.append(
                    requirementCell,
                    descriptionCell,
                    statusCell(requirementDetails.available)
                );
                body.appendChild(requirementRow);
            });
        });
    }

    return {appendMarkdown: appendMarkdown, render: render};
})();

$(function() {
    var converter = window.markdownit({html: false, linkify: false, typographer: false});
    $.ajax('api/features').done(function(data) {
        FeatureReport.render(data, document.querySelector('tbody.feature-results'), converter);
    });
});
