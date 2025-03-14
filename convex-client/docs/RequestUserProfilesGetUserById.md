# RequestUserProfilesGetUserById


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**args** | [**RequestSessionsGetActiveSessionArgs**](RequestSessionsGetActiveSessionArgs.md) |  | 

## Example

```python
from convex_client.models.request_user_profiles_get_user_by_id import RequestUserProfilesGetUserById

# TODO update the JSON string below
json = "{}"
# create an instance of RequestUserProfilesGetUserById from a JSON string
request_user_profiles_get_user_by_id_instance = RequestUserProfilesGetUserById.from_json(json)
# print the JSON string representation of the object
print(RequestUserProfilesGetUserById.to_json())

# convert the object into a dict
request_user_profiles_get_user_by_id_dict = request_user_profiles_get_user_by_id_instance.to_dict()
# create an instance of RequestUserProfilesGetUserById from a dict
request_user_profiles_get_user_by_id_from_dict = RequestUserProfilesGetUserById.from_dict(request_user_profiles_get_user_by_id_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


