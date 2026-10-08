import unittest

from owrx.form.input import DropdownInput, Option, TextAreaInput, TextInput
from owrx.form.section import OptionalSection


class FormSecurityTests(unittest.TestCase):
    def test_textarea_and_help_text_escape_untrusted_markup(self):
        field = TextAreaInput(
            "description",
            '<label onmouseover="alert(1)">Description</label>',
            infotext='<a href="javascript:alert(1)" onclick="alert(2)">help</a><img src=x onerror=alert(3)>',
        )
        rendered = field.render({"description": "<script>alert(4)</script>"}, {})
        self.assertIn("&lt;label onmouseover=&quot;alert(1)&quot;&gt;", rendered)
        self.assertIn("&lt;script&gt;alert(4)&lt;/script&gt;", rendered)
        self.assertIn("<a>help</a>", rendered)
        self.assertNotIn("javascript:", rendered)
        self.assertNotIn("onerror", rendered)
        self.assertNotIn("<script>", rendered)

    def test_dropdown_values_and_labels_are_context_escaped(self):
        field = DropdownInput(
            "mode",
            "Mode",
            [Option('x" onfocus="alert(1)', '<img src=x onerror=alert(2)>')],
        )
        rendered = field.render({"mode": ""}, {})
        self.assertIn('value="x&quot; onfocus=&quot;alert(1)"', rendered)
        self.assertIn("&lt;img src=x onerror=alert(2)&gt;", rendered)
        self.assertNotIn("<img", rendered)

    def test_optional_field_selector_escapes_dynamic_ids_and_labels(self):
        section = OptionalSection("Optional", [], [], [])
        section.optional_inputs = [TextInput('id" autofocus="true', "<img src=x>")]
        rendered = section.render_optional_select()
        self.assertIn('value="id&quot; autofocus=&quot;true"', rendered)
        self.assertIn("&lt;img src=x&gt;", rendered)
        self.assertNotIn("<img", rendered)


if __name__ == "__main__":
    unittest.main()
