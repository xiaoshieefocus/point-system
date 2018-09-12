# Require any additional compass plugins here.
require "susy"

relative_assets = true

# Set this to the root of your project when deployed:
http_path = "/"
css_dir = "styles"
sass_dir = "styles/sass"
images_dir = "images"
javascripts_dir = "javascripts"
$version = ''

# Get cahe buster from package.json -> version
begin
    require 'open-uri'
    require 'rubygems'
    require 'json'

    file = open("../package.json")
    json = file.read
    parsed = JSON.parse(json)
    $version = parsed['version']

    asset_cache_buster do |http_path, real_path|
        "version=" + parsed['version']
    end
end

# You can select your preferred output style here (can be overridden via the command line):
# output_style = :expanded or :nested or :compact or :compressed

output_style = :compressed

# To enable relative paths to assets via compass helper functions. Uncomment:
# relative_assets = true

# To disable debugging comments that display the original location of your selectors. Uncomment:
# line_comments = false


# If you prefer the indented syntax, you might want to regenerate this
# project again passing --syntax sass, or you can uncomment this:
preferred_syntax = :sass
# and then run:
# sass-convert -R --from scss --to sass sass scss && rm -rf sass && mv scss sass

module Sass::Script::Functions
  def cdnurl(url)
    assert_type url, :String
    Sass::Script::String.new("url(//bom2buy-static.oss-cn-shanghai.aliyuncs.com/#{url.value}?version=#{$version})")
  end
  declare :cdnurl, [:url]
end
