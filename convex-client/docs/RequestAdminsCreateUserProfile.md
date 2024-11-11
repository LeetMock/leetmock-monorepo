# RequestAdminsCreateUserProfile


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**args** | [**RequestAdminsCreateUserProfileArgs**](RequestAdminsCreateUserProfileArgs.md) |  | 

## Example

```python
from convex_client.models.request_admins_create_user_profile import RequestAdminsCreateUserProfile

# TODO update the JSON string below
json = "{}"
# create an instance of RequestAdminsCreateUserProfile from a JSON string
request_admins_create_user_profile_instance = RequestAdminsCreateUserProfile.from_json(json)
# print the JSON string representation of the object
print(RequestAdminsCreateUserProfile.to_json())

# convert the object into a dict
request_admins_create_user_profile_dict = request_admins_create_user_profile_instance.to_dict()
# create an instance of RequestAdminsCreateUserProfile from a dict
request_admins_create_user_profile_from_dict = RequestAdminsCreateUserProfile.from_dict(request_admins_create_user_profile_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


