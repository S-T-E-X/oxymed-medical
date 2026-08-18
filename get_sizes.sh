curl -s http://localhost:8080/api/settings | jq -r 'to_entries | .[] | select(.key | test("image|img")) | .key + " " + .value' | while read key url; do
  echo "Fetching $key from $url..."
  curl -s "http://localhost:8080$url" > "tmp_img_$key"
  dim=$(identify -format "%w %h" "tmp_img_$key" 2>/dev/null)
  echo "$key: $dim"
  rm "tmp_img_$key"
done
