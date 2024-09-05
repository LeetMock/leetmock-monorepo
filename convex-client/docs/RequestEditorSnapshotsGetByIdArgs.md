# RequestEditorSnapshotsGetByIdArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**snapshot_id** | **str** | ID from table \&quot;editorSnapshots\&quot; | [optional] 

## Example

```python
from convex_client.models.request_editor_snapshots_get_by_id_args import RequestEditorSnapshotsGetByIdArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestEditorSnapshotsGetByIdArgs from a JSON string
request_editor_snapshots_get_by_id_args_instance = RequestEditorSnapshotsGetByIdArgs.from_json(json)
# print the JSON string representation of the object
print(RequestEditorSnapshotsGetByIdArgs.to_json())

# convert the object into a dict
request_editor_snapshots_get_by_id_args_dict = request_editor_snapshots_get_by_id_args_instance.to_dict()
# create an instance of RequestEditorSnapshotsGetByIdArgs from a dict
request_editor_snapshots_get_by_id_args_from_dict = RequestEditorSnapshotsGetByIdArgs.from_dict(request_editor_snapshots_get_by_id_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


