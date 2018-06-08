#!/usr/bin/env python
#
# Licensed to Cloudera, Inc. under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  Cloudera, Inc. licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# This program creates a manifest.json file from a directory of parcels and
# places the file in the same directory as the parcels.
# Once created, the directory can be served over http as a parcel repository.

import hashlib
import json
import os
import re
import sys
import tarfile
import time

def _get_parcel_dirname(parcel_name):
  """
  Extract the required parcel directory name for a given parcel.
  eg: CDH-5.0.0-el6.parcel -> CDH-5.0.0
  """
  parts = re.match(r"^(.*?)-(.*)-(.*?)$", parcel_name).groups()
  return parts[0] + '-' + parts[1]

def _safe_copy(key, src, dest):
  """
  Conditionally copy a key/value pair from one dictionary to another.
  Nothing is done if the key is not present in the source dictionary
  """
  if key in src:
    dest[key] = src[key]

def make_manifest(path, timestamp=time.time()):
  """
  Make a manifest.json document from the contents of a directory.
  This function will scan the specified directory, identify any parcel files
  in it, and then build a manifest from those files. Certain metadata will be
  extracted from the parcel and copied into the manifest.
  @param path: The path of the directory to scan for parcels
  @param timestamp: Unix timestamp to place in manifest.json
  @return: the manifest.json as a string
  """
  manifest = {}
  manifest['lastUpdated'] = int(timestamp * 1000)
  manifest['parcels'] = []

  files = os.listdir(path)
  for f in files:
    if not f.endswith('.parcel'):
      continue

    print("Found parcel %s" % (f,))
    entry = {}
    entry['parcelName'] = f

    fullpath = os.path.join(path, f)

    with open(fullpath, 'rb') as fp:
      entry['hash'] = hashlib.sha1(fp.read()).hexdigest()

    with tarfile.open(fullpath, 'r') as tar:
      try:
        json_member = tar.getmember(os.path.join(_get_parcel_dirname(f),
                                    'meta', 'parcel.json'))
      except KeyError:
        print("Parcel does not contain parcel.json")
        continue
      try:
        parcel = json.loads(tar.extractfile(json_member).read().decode(encoding='UTF-8'))
      except:
        print("Failed to parse parcel.json")
        continue
      _safe_copy('depends', parcel, entry)
      _safe_copy('replaces', parcel, entry)
      _safe_copy('conflicts', parcel, entry)
      _safe_copy('components', parcel, entry)
      _safe_copy('servicesRestartInfo', parcel, entry)

      try:
        notes_member = tar.getmember(os.path.join(_get_parcel_dirname(f),
                                     'meta', 'release-notes.txt'))
        entry['releaseNotes'] = tar.extractfile(notes_member).read().decode(encoding='UTF-8')
      except KeyError:
        # No problem if there's no release notes
        pass

    manifest['parcels'].append(entry)

  return json.dumps(manifest, indent=4, separators=(',', ': '))

if __name__ == "__main__":
  path = os.path.curdir
  if len(sys.argv) > 1:
    path = sys.argv[1]
  print("Scanning directory: %s" % (path))

  manifest = make_manifest(path)
  with open(os.path.join(path, 'manifest.json'), 'w') as fp:
    fp.write(manifest)